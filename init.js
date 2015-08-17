/**
 * CodeMirror plugin for DokuWiki
 *
 * @author Albert Gasset <albertgasset@fsfe.org>
 * @license GNU GPL version 2 or later
 */

/* global CodeMirror, DokuCookie, dw_editor, jQuery, JSINFO, LANG */

jQuery(function() {
    'use strict';

    var textarea = jQuery('#wiki__text');

    if (!textarea.length) {
        return;
    }

    var cm, mode;

    var settings = {
        activeline: {
            default_: '0',
            callback: function(value) {
                if (cm) {
                    cm.setOption('styleActiveLine', value === '1');
                }
            }
        },
        closebrackets: {
            default_: '0',
            callback: function(value) {
                if (cm) {
                    cm.setOption('autoCloseBrackets', value === '1');
                }
            }
        },
        fontsize: {
            default_: '14',
            choices: ['10', '11',  '12', '13', '14', '16', '18', '20', '24'],
            callback: function(value) {
                if (cm) {
                    var wrapper = cm.getWrapperElement();
                    jQuery(wrapper).css('font-size', value + 'px');
                    cm.refresh();
                }
            }
        },
        keymap: {
            default_: 'default',
            choices: ['default', 'emacs', 'sublime', 'vim'],
            callback: function(value) {
                if (cm) {
                    requireKeyMap(value, function() {
                        cm.setOption('vimMode', value === 'vim');
                        cm.setOption('keyMap', value);
                    });
                }
            }
        },
        linenumbers: {
            default_: '0',
            callback: function(value) {
                if (cm) {
                    cm.setOption('lineNumbers', value === '1');
                }
            }
        },
        matchbrackets: {
            default_: '1',
            callback: function(value) {
                if (cm) {
                    cm.setOption('matchBrackets', value === '1');
                }
            }
        },
        nativeeditor: {
            default_: JSINFO.plugin_codemirror.nativeeditor.toString(),
            callback: function(value) {
                if (!cm && value === '0') {
                    initCodeMirror();
                } else if (cm && value === '1') {
                    destroyCodeMirror();
                }
            }
        },
        syntax: {
            default_: '1',
            callback: function(value) {
                if (cm) {
                    cm.setOption('mode', value === '1' ? mode : 'null');
                }
            }
        },
        theme: {
            default_: 'default',
            choices: [
                '3024-day', '3024-night', 'ambiance', 'ambiance-mobile',
                'base16-dark', 'base16-light', 'blackboard', 'cobalt',
                'default', 'eclipse', 'elegant', 'erlang-dark', 'lesser-dark',
                'mbo', 'mdn-like', 'midnight', 'monokai', 'neat', 'neo',
                'night', 'paraiso-dark', 'paraiso-light', 'pastel-on-dark',
                'rubyblue', 'solarized', 'the-matrix', 'tomorrow-night-bright',
                'tomorrow-night-eighties', 'twilight', 'vibrant-ink', 'xq-dark',
                'xq-light', 'zenburn',
            ],
            callback: function(value) {
                if (cm) {
                    cm.setOption('theme', value);
                }
            }
        },
    };

    initMode();
    initHooks();
    initSettingsMenu();

    if (getSetting('nativeeditor') === '0') {
        initCodeMirror();
    }

    function destroyCodeMirror() {
        var selection = window.DWgetSelection(textarea.get(0));
        cm.toTextArea();
        cm = null;
        window.DWsetSelection(selection);
        textarea.focus();
    }

    function initCodeMirror() {
        var selection = window.DWgetSelection(textarea.get(0));
        cm = CodeMirror.fromTextArea(textarea.get(0), {mode: 'null'});
        cm.setOption('lineWrapping', textarea.prop('wrap') !== 'off');
        cm.setOption('readOnly', textarea.prop('readonly'));
        cm.setOption('tabSize', 8);
        cm.setOption('extraKeys', {
            'Enter': function(cm) {
                return indentCommand(cm, 'Enter');
            },
            'Space': function(cm) {
                return indentCommand(cm, 'Space');
            },
            'Backspace' : function(cm) {
                return indentCommand(cm, 'Backspace');
            },
            'Ctrl-Enter': function() {
                jQuery('#edbtn__save').click();
            },
        });
        cm.setOption('scrollbarStyle', 'overlay');
        cm.setSize(null, textarea.css('height'));
        jQuery.each(settings, function(name, setting) {
            if (name !== 'nativeeditor') {
                var value = getSetting(name);
                setting.callback(value);
            }
        });
        window.DWsetSelection(selection);
    }

    function initMode() {
        mode = JSINFO.plugin_codemirror;

        CodeMirror.modeURL = url('/dist/modes/%N.min.js');

        mode.name = 'doku';
        mode.loadMode = function(mode) {
            var spec = {};
            if (mode) {
                spec.name = mode.mime || mode.name;
                jQuery.each(mode.options || [], function(key, value) {
                    spec[key] = value;
                });
                jQuery.each(mode.deps || [], function(index, name) {
                    CodeMirror.autoLoadMode(cm, name);
                });
                CodeMirror.autoLoadMode(cm, mode.name);
            } else {
                spec.name = 'doku-null';
            }
            return CodeMirror.getMode(cm.options, spec);
        };

        CodeMirror.defineMode('doku-null', function() {
            return {
                token: function(stream) {
                    stream.next();
                }
            };
        });
    }

    function initHooks() {
        var dw = {
            setWrap: dw_editor.setWrap,
            sizeCtl: dw_editor.sizeCtl,
            currentHeadlineLevel: window.currentHeadlineLevel,
            selection_class: window.selection_class,
            DWgetSelection: window.DWgetSelection || window.getSelection,
            DWsetSelection: window.DWsetSelection || window.setSelection,
            pasteText: window.pasteText,
        };

        dw_editor.setWrap = function(editor, value) {
            dw.setWrap(editor, value);
            if (cm && textarea.is(editor)) {
                cm.setOption('lineWrapping', value !== 'off');
            }
        };

        dw_editor.sizeCtl = function(editor, value) {
            dw.sizeCtl(editor, value);
            if (cm && textarea.is(editor)) {
                cm.setSize(null, textarea.css('height'));
            }
        };

        window.currentHeadlineLevel = function(id) {
            if (cm && textarea.is('#' + id)) {
                textarea.val(cm.getDoc().getValue());
            }
            return dw.currentHeadlineLevel(id);
        };

        window.selection_class = function() {
            dw.selection_class.apply(this);
            var dw_getText = this.getText;
            this.geText = function() {
                if (cm && textarea.is(this.obj)) {
                    var doc = cm.getDoc();
                    var from = doc.indexFromPos(this.start);
                    var to = doc.indexFromPos(this.end);
                    return doc.getRange(from, to);
                } else {
                    return dw_getText.apply(this);
                }
            };
        };

        window.DWgetSelection = function(editor) {
            if (cm && textarea.is(editor)) {
                var doc = cm.getDoc();
                var selection = new window.selection_class();
                selection.obj = editor;
                selection.start = doc.indexFromPos(doc.getCursor('from'));
                selection.end = doc.indexFromPos(doc.getCursor('to'));
                // workaround for edittable plugin
                textarea.val(doc.getValue());
                return selection;
            } else {
                return dw.DWgetSelection(editor);
            }
        };

        window.DWsetSelection = function(selection) {
            if (cm && textarea.is(selection.obj)) {
                var doc = cm.getDoc();
                var anchor = doc.posFromIndex(selection.start);
                var head = doc.posFromIndex(selection.end);
                doc.setSelection(anchor, head);
                cm.focus();
            } else {
                dw.DWsetSelection(selection);
            }
        };

        window.pasteText = function(selection, text, opts) {
            if (cm && textarea.is(selection.obj)) {
                var doc = cm.getDoc();
                textarea.val(doc.getValue());
                var from = doc.posFromIndex(selection.start);
                var to = doc.posFromIndex(selection.end);
                doc.replaceRange(text, from, to);
                dw.pasteText(selection, text, opts);
                cm.focus();
            } else {
                dw.pasteText(selection, text, opts);
            }
        };
    }

    function initSettingsButton(menu) {
        var button = jQuery('<img>').attr('class', 'cm-settings-button');

        button.attr('src', JSINFO.plugin_codemirror.iconURL);
        button.on('click', function() {
            var btnOffset = jQuery(this).offset();
            var btnWidth = jQuery(this).outerWidth();
            var menuWidth = menu.outerWidth();
            var menuHeight = menu.outerHeight();
            menu.css('top', btnOffset.top - menuHeight);
            menu.css('left', btnOffset.left + btnWidth - menuWidth);
            menu.toggle();
            return false;
        });

        if (jQuery('#size__ctl').length > 0) {
            button.appendTo('#size__ctl');
        } else {
            button.appendTo('#draft__status');
        }
    }

    function initSettingsMenu() {
        var menu = jQuery('<ul>').addClass('cm-settings-menu');
        var items = [
            'theme',
            'fontsize',
            'keymap',
            'closebrackets',
            'linenumbers',
            'activeline',
            'matchbrackets',
            'syntax',
            '-',
            'nativeeditor',
        ];

        jQuery.each(items, function(index, name) {
            var setting = settings[name];
            var title = LANG.plugins.codemirror['setting_' + name];

            // Separator
            if (name === '-') {
                menu.append('<li>-</li>');
                return;
            }

            var item = jQuery('<li>');
            var link = jQuery('<a>').html(title);
            var value = getSetting(name);
            var disabled = getSetting('nativeeditor') === '1';

            if (setting.choices) {
                // Choice setting
                var submenu = jQuery('<ul>');
                jQuery.each(setting.choices, function(index, choice) {
                    var item = jQuery('<li>');
                    item.data('setting', name);
                    item.data('choice', choice);
                    var link = jQuery('<a>').html(choice);
                    var icon = jQuery('<span>').addClass('ui-icon');
                    if (value === choice) {
                        icon.addClass('ui-icon-check');
                    } else {
                        icon.addClass('ui-icon-blank');
                    }
                    link.append(icon);
                    item.append(link);
                    submenu.append(item);
                });
                item.append(submenu);
            } else {
                // Boolean setting
                item.data('setting', name);
                var icon = jQuery('<span>').addClass('ui-icon');
                if (value === '1') {
                    icon.addClass('ui-icon-check');
                } else {
                    icon.addClass('ui-icon-blank');
                }
                link.append(icon);
            }

            if (disabled && name !== 'nativeeditor') {
                item.addClass('ui-state-disabled');
            }

            item.append(link);
            menu.append(item);
        });

        menu.menu({position: {my: 'right top', at: 'left top'}});

        jQuery('body').on('click', function() {
            // Hide menu and collapse submenus
            setTimeout(function() {
                menu.menu('collapseAll', null, true);
            }, 200);
            menu.hide();
        });

        menu.on('menuselect', function(event, ui) {
            var name = ui.item.data('setting');
            var value = ui.item.data('choice');
            var icon = ui.item.find('.ui-icon');

            if (!name) {
                // Submenu, do nothing and prevent hiding
                return false;
            }

            if (value) {
                // Choice setting
                var icons = ui.item.siblings().find('.ui-icon');
                icons.removeClass('ui-icon-check');
                icons.addClass('ui-icon-blank');
                icon.removeClass('ui-icon-blank');
                icon.addClass('ui-icon-check');
            } else {
                // Boolean setting
                value = icon.hasClass('ui-icon-check') ? '0' : '1';
                icon.removeClass('ui-icon-blank ui-icon-check');
                if (value === '1') {
                    icon.addClass('ui-icon-check');
                } else {
                    icon.addClass('ui-icon-blank');
                }
            }

            if (name === 'nativeeditor') {
                if (value === '1') {
                    ui.item.siblings().addClass('ui-state-disabled');
                } else {
                    ui.item.siblings().removeClass('ui-state-disabled');
                }
            }

            setSetting(name, value);
        });

        menu.appendTo('body');
        initSettingsButton(menu);
    }

    function getSetting(name) {
        var value = DokuCookie.getValue('cm-' + name);
        var setting = settings[name];

        if (setting.choices) {
            // Choice setting
            if (!value || jQuery.inArray(value, setting.choices) < 0) {
                value = setting.default_;
            }
        } else {
            // Boolean setting
            if (value !== '0' && value !== '1') {
                value = setting.default_;
            }
        }

        DokuCookie.setValue('cm-' + name, value);

        return value;
    }

    function setSetting(name, value) {
        DokuCookie.setValue('cm-' + name, value);
        settings[name].callback(value);
    }

    function requireKeyMap(name, callback) {
        if (CodeMirror.keyMap[name]) {
            callback();
            return;
        }

        var count = 0;

        jQuery('<script>')
            .attr('src', url('/dist/keymaps/' + name + '.min.js'))
            .appendTo('head');

        function check() {
            count += 1;

            // stop checking after 20s
            if (count > 100) {
                clearInterval(intervalID);
            }

            if (CodeMirror.keyMap[name]) {
                clearInterval(intervalID);
                callback();
            }
        }

        var intervalID = setInterval(check, 200);
    }

    function indentCommand(cm, key) {
        var doc = cm.getDoc();
        if (doc.somethingSelected()) {
            return CodeMirror.Pass;
        }
        var pos = doc.getCursor();
        if (cm.getModeAt(pos) !== doc.getMode()) {
            // Cursor on inner mode
            return CodeMirror.Pass;
        }
        var line = doc.getLine(pos.line);
        var before = line.slice(0, pos.ch);
        var match = before.match(/^(  +)([-*] )?/);
        if (!match) {
            return CodeMirror.Pass;
        }
        if (key !== 'Enter' && pos.ch > match[0].length) {
            // Space and Backspace only work before content
            return CodeMirror.Pass;
        }
        if (key === 'Enter') {
            if (match[2] && match[0] === line) {
                // List item is empty, cancel list
                doc.replaceRange('\n',  {line: pos.line, ch: 0}, pos);
            } else {
                doc.replaceRange('\n' + match[0], pos);
            }
        } else if (key === 'Space') {
            doc.replaceRange('  ' + before, {line: pos.line, ch: 0}, pos);
        } else if (key === 'Backspace') {
            if (match[1].length >= 4) {
                before = before.slice(2);
            } else {
                // Cancel list or preformatted block
                before = '';
            }
            doc.replaceRange(before, {line: pos.line, ch: 0}, pos);
        }
    }

    function url(path) {
        return (JSINFO.plugin_codemirror.baseURL + '/' + path +
                '?v=' + JSINFO.plugin_codemirror.version);
    }
});
