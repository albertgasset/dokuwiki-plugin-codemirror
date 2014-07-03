/**
 * CodeMirror plugin for DokuWiki
 *
 * @author Albert Gasset <albertgasset@fsfe.org>
 * @license GNU GPL version 2 or later
 */

/* global CodeMirror, DokuCookie, dw_editor, jQuery, JSINFO, LANG */

jQuery(function() {
    'use strict';

    var loadedThemes = {'default': true};
    var textarea = jQuery('#wiki__text');

    if (!textarea.length) {
        return;
    }

    var cm = initCodeMirror();
    var mode = initMode(cm);

    initHooks(cm);

    initSettingsMenu([{
        name: 'theme',
        default_: 'default',
        choices: [
            '3024-day', '3024-night', 'ambiance', 'ambiance-mobile',
            'base16-dark', 'base16-light', 'blackboard', 'cobalt', 'default',
            'eclipse', 'elegant', 'erlang-dark', 'lesser-dark', 'mbo',
            'mdn-like', 'midnight', 'monokai', 'neat', 'neo', 'night',
            'paraiso-dark', 'paraiso-light', 'pastel-on-dark', 'rubyblue',
            'solarized', 'the-matrix', 'tomorrow-night-eighties', 'twilight',
            'vibrant-ink', 'xq-dark', 'xq-light',
        ],
        callback: function(value, init) {
            requireTheme(value, init, function() {
                cm.setOption('theme', value);
            });
        },
    }, {
        name: 'fontsize',
        default_: '14',
        choices: ['10', '11',  '12', '13', '14', '16', '18', '20', '24'],
        callback: function(value) {
            jQuery(cm.getWrapperElement()).css('font-size', value + 'px');
            cm.refresh();
        },
    }, {
        name: 'keymap',
        default_: 'default',
        choices: ['default', 'emacs', 'sublime', 'vim'],
        callback: function(value) {
            requireKeyMap(value, function() {
                cm.setOption('vimMode', value === 'vim');
                cm.setOption('keyMap', value);
            });
        },
    }, {
        name: '-',
    }, {
        name: 'closebrackets',
        default_: '0',
        callback: function(value) {
            cm.setOption('autoCloseBrackets', value === '1');
        },
    }, {
        name: 'linenumbers',
        default_: '0',
        callback: function(value) {
            cm.setOption('lineNumbers', value === '1');
        },
    }, {
        name: 'activeline',
        default_: '0',
        callback: function(value) {
            cm.setOption('styleActiveLine', value === '1');
        },
    }, {
        name: 'matchbrackets',
        default_: '1',
        callback: function(value) {
            cm.setOption('matchBrackets', value === '1');
        },
    }, {
        name: 'syntax',
        default_: '1',
        callback: function(value) {
            cm.setOption('mode', value === '1' ? mode : 'null');
        },
    }]);


    function initCodeMirror() {
        var cm = CodeMirror.fromTextArea(textarea.get(0), {mode: 'null'});
        cm.setOption('lineWrapping', textarea.prop('wrap') !== 'off');
        cm.setOption('readOnly', textarea.prop('readonly'));
        return cm;
    }

    function initMode(cm) {
        var mode = JSINFO.plugin_codemirror;

        CodeMirror.modeURL = url('/dist/modes/%N.min.js');

        mode.name = 'doku';
        mode.loadMode = function(mode) {
            mode = mode || {name: 'null'};
            if (mode.deps)  {
                for (var i = 0; i < mode.deps.length; i += 1) {
                    CodeMirror.autoLoadMode(cm, mode.deps[i]);
                }
            }
            CodeMirror.autoLoadMode(cm, mode.name);
            return CodeMirror.getMode(cm.options, mode.mime || mode.name);
        };

        return mode;
    }

    function initHooks(cm) {
        var doc = cm.getDoc();
        var dw = {
            setWrap: dw_editor.setWrap,
            sizeCtl: dw_editor.sizeCtl,
            currentHeadlineLevel: window.currentHeadlineLevel,
            selection_class: window.selection_class,
            DWgetSelection: window.DWgetSelection,
            DWsetSelection: window.DWsetSelection,
            pasteText: window.pasteText,
        };

        dw_editor.setWrap = function(editor, value) {
            dw.setWrap(editor, value);
            if (textarea.is(editor)) {
                cm.setOption('lineWrapping', value !== 'off');
            }
        };

        dw_editor.sizeCtl = function(editor, value) {
            dw.sizeCtl(editor, value);
            if (textarea.is(editor)) {
                cm.setSize(null, textarea.css('height'));
            }
        };

        window.currentHeadlineLevel = function(id) {
            if (textarea.is('#' + id)) {
                textarea.val(doc.getValue());
            }
            return dw.currentHeadlineLevel(id);
        };

        window.selection_class = function() {
            dw.selection_class.apply(this);
            var dw_getText = this.getText;
            this.geText = function() {
                if (textarea.is(this.obj)) {
                    var from = doc.indexFromPos(this.start);
                    var to = doc.indexFromPos(this.end);
                    return doc.getRange(from, to);
                } else {
                    return dw_getText.apply(this);
                }
            };
        };

        window.DWgetSelection = function(editor) {
            if (textarea.is(editor)) {
                var selection = new window.selection_class();
                selection.obj = editor;
                selection.start = doc.indexFromPos(doc.getCursor('from'));
                selection.end = doc.indexFromPos(doc.getCursor('to'));
                // workaround for edittable plugin
                textarea.val(doc.getValue());
                return selection;
            } else {
                return window.DWgetSelection(editor);
            }
        };

        window.DWsetSelection = function(selection) {
            if (textarea.is(selection.obj)) {
                var anchor = doc.posFromIndex(selection.start);
                var head = doc.posFromIndex(selection.end);
                doc.setSelection(anchor, head);
                cm.focus();
            } else {
                window.DWsetSelection(selection);
            }
        };

        window.pasteText = function(selection, text, opts) {
            if (textarea.is(selection.obj)) {
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

    function initSettingsMenu(settings) {
        var menu = jQuery('<ul>').attr('class', 'cm-settings-menu');
        var check = '<span class="ui-icon ui-icon-check"></span>';
        var callback = {};

        for (var i = 0; i < settings.length; i += 1) {
            var s = settings[i];
            var title = LANG.plugins.codemirror['setting_' + s.name];

            // Separator
            if (s.name === '-') {
                menu.append('<li>-</li>');
                continue;
            }

            var value = getSetting(s.name, s.default_);

            if (s.choices) {
                // Choice setting
                var item = jQuery('<li><a>' + title + '</a></li>');
                var submenu = jQuery('<ul>').appendTo(item);
                for (var j = 0; j < s.choices.length; j += 1) {
                    var c = s.choices[j];
                    submenu.append('<li data-setting="' + s.name + '" ' +
                                   'data-choice="' + c + '" ' +
                                   (value === c ? 'class="enabled"' : '') +
                                   '><a>' + check + c + '</a></li>');
                }
                menu.append(item);
            } else {
                // Boolean setting
                menu.append('<li data-setting="' + s.name + '" ' +
                            (value === '1' ? 'class="enabled"' : '') +
                            '><a>' + check + title + '</a></li>');
            }

            callback[s.name] = s.callback;
            s.callback(value, true);
        }

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

            if (!name) {
                // Submenu, do nothing and prevent hiding
                return false;
            }

            if (value) {
                // Choice setting
                ui.item.siblings().removeClass('enabled');
                ui.item.addClass('enabled');
            } else {
                // Boolean setting
                value = getSetting(name) === '1' ? '0' : '1';
                ui.item.toggleClass('enabled');
            }

            setSetting(name, value);
            callback[name](value);
        });

        menu.appendTo('body');
        initSettingsButton(menu);
    }

    function getSetting(name, default_) {
        var value = DokuCookie.getValue('cm-' + name);

        if (!value && default_) {
            value = default_;
            DokuCookie.setValue('cm-' + name, default_);
        }

        return value;
    }

    function setSetting(name, value) {
        DokuCookie.setValue('cm-' + name, value);
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

    function requireTheme(name, init, callback) {
        if (loadedThemes[name]) {
            callback();
            return;
        }

        jQuery('<link>')
            .attr('rel', 'stylesheet')
            .attr('href', url('/dist/themes/' + name + '.min.css'))
            .appendTo('head')
            .on('load', callback);

        loadedThemes[name] = true;
    }

    function url(path) {
        return (JSINFO.plugin_codemirror.baseURL + '/' + path +
                '?v=' + JSINFO.plugin_codemirror.version);
    }
});
