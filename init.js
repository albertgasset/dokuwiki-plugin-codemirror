/**
 * CodeMirror plugin for DokuWiki
 *
 * @author Albert Gasset <albertgasset@fsfe.org>
 * @license GNU GPL version 2 or later
 */

/* global CodeMirror, DokuCookie, dw_editor, dw_locktimer, jQuery,
          JSINFO, LANG */

jQuery(function() {
    'use strict';

    var cm, dokuMode;

    var codeModes = {
        apl: {name: 'apl'},
        asciiarmor: {name: 'asciiarmor'},
        'asn.1': {name: 'asn.1', mime: 'text/x-ttcn-asn'},
        asterisk: {name: 'asterisk'},
        aspx: {name: 'htmlembedded', mime: 'application/x-aspx',
               deps: ['clike']},
        bash: {name: 'shell'},
        brainfuck: {name: 'brainfuck'},
        c: {name: 'clike', mime: 'text/x-csrc'},
        cassandra: {name: 'sql', mime: 'text/x-cassandra'},
        ceylon: {name: 'clike', mime: 'text/x-ceylon'},
        clojure: {name: 'clojure'},
        cmake: {name: 'cmake'},
        cobol: {name: 'cobol'},
        coffeescript: {name: 'coffeescript'},
        cpp: {name: 'clike', mime: 'text/x-c++src'},
        crystal: {name: 'crystal'},
        csharp: {name: 'clike', mime: 'text/x-csharp'},
        css: {name: 'css', mime: 'text/css'},
        cypher: {name: 'cypher'},
        cython: {name: 'python', mime: 'text/x-cython'},
        diff: {name: 'diff'},
        d: {name: 'd', mime: 'text/x-d'},
        dart: {name: 'dart'},
        django: {name: 'django', deps: ['htmlmixed']},
        dockerfile: {name: 'dockerfile'},
        dtd: {name: 'dtd'},
        dylan: {name: 'dylan'},
        ebnf: {name: 'ebnf'},
        ecl: {name: 'ecl'},
        ecmascript: {name: 'javascript', mime: 'application/ecmascript'},
        elm: {name: 'elm'},
        erb: {name: 'htmlembedded', mime: 'application/x-erb',
              deps: ['ruby']},
        eiffel: {name: 'eiffel'},
        ejs: {name: 'htmlembedded', mime: 'application/x-ejs',
              deps: ['javascript']},
        erlang: {name: 'erlang'},
        factor: {name: 'factor'},
        fcl: {name: 'fcl'},
        forth: {name: 'forth'},
        fortran: {name: 'fortran'},
        fsharp: {name: 'mllike', mime: 'text/x-fsharp'},
        gfm: {name: 'gfm'},
        gherkin: {name: 'gherkin'},
        glsl: {name: 'clike', mime: 'x-shader/x-vertex'},
        go: {name: 'go'},
        gql: {name: 'sql', mime: 'text/x-gql'},
        groovy: {name: 'groovy'},
        gss: {name: 'css', mime: 'text/x-gss'},
        haml: {name: 'haml'},
        handlebars: {name: 'handlebars'},
        haskell: {name: 'haskell'},
        'haskell-literate': {name: 'haskell-literate'},
        haxe: {name: 'haxe', mime: 'text/x-haxe'},
        hive: {name: 'sql', mime: 'text/x-hive'},
        html: {name: 'htmlmixed'},
        html5: {name: 'htmlmixed'},
        http: {name: 'http'},
        hxml: {name: 'haxe', mime: 'text/x-hxml'},
        idl: {name: 'idl'},
        ini: {name: 'properties'},
        jade: {name: 'jade', deps: ['javascript']},
        java5: {name: 'clike', mime: 'text/x-java'},
        java: {name: 'clike', mime: 'text/x-java'},
        javascript: {name: 'javascript', mime: 'application/javascript'},
        jinja2: {name: 'jinja2'},
        json: {name: 'javascript', mime: 'application/json'},
        jsonld: {name: 'javascript', mime: 'application/ld+json'},
        jsp: {name: 'htmlembedded', mime: 'application/x-jsp',
              deps: ['clike']},
        jsx: {name: 'jsx'},
        julia: {name: 'julia'},
        kotlin: {name: 'clike', mime: 'text/x-kotlin'},
        latex: {name: 'stex'},
        less: {name: 'css', mime: 'text/x-less'},
        lisp: {name: 'commonlisp'},
        livescript: {name: 'livescript'},
        lua: {name: 'lua'},
        mariadb: {name: 'sql', mime: 'text/x-mariadb'},
        markdown: {name: 'markdown'},
        matlab: {name: 'octave'},
        mbox: {name: 'mbox'},
        modelica: {name: 'modelica', mime: 'text/x-modelica'},
        mscgen: {name: 'mscgen'},
        mscgenny: {name: 'mscgen', mime: 'text/x-msgenny'},
        mssql: {name: 'sql', mime: 'text/x-mssql'},
        mumps: {name: 'mumps'},
        mysql: {name: 'sql', mime: 'text/x-sql'},
        nginx: {name: 'nginx'},
        nsis: {name: 'nsis'},
        ntriples: {name: 'ntriples'},
        objc: {name: 'clike', mime: 'text/x-objectivec'},
        ocaml: {name: 'mllike', mime: 'text/x-ocaml'},
        octave: {name: 'octave'},
        oz: {name: 'oz'},
        pascal: {name: 'pascal'},
        pgp: {name: 'asciiarmor'},
        pegjs: {name: 'pegjs'},
        perl: {name: 'perl'},
        pgsql: {name: 'sql', mime: 'text/x-pgsql'},
        php: {name: 'php', mime: 'application/x-httpd-php-open',
              deps: ['htmlmixed']},
        pig: {name: 'pig', mime: 'text/x-pig'},
        plsql: {name: 'sql', mime: 'text/x-plsql'},
        postgresql: {name: 'sql', mime: 'text/x-pgsql'},
        powershell: {name: 'powershell'},
        properties: {name: 'properties'},
        protobuf: {name: 'protobuf'},
        python: {name: 'python', mime: 'text/x-python'},
        puppet: {name: 'puppet'},
        q: {name: 'q'},
        r: {name: 'r'},
        rpmchanges: {name: 'rpm', mime: 'text/x-rpm-changes'},
        rpmspec: {name: 'rpm', mime: 'text/x-rpm-spec'},
        rst: {name: 'rst'},
        ruby: {name: 'ruby'},
        rust: {name: 'rust'},
        sas: {name: 'sas'},
        sass: {name: 'sass'},
        scala: {name: 'clike', mime: 'text/x-scala'},
        scheme: {name: 'scheme'},
        scss: {name: 'css', mime: 'text/x-scss'},
        sieve: {name: 'sieve'},
        slim: {name: 'slim'},
        smalltalk: {name: 'smalltalk'},
        smarty: {name: 'smarty', options: {version: 2}},
        smarty3: {name: 'smarty', options: {version: 3}},
        solr: {name: 'solr'},
        soy: {name: 'soy'},
        sparql: {name: 'sparql'},
        spreadsheet: {name: 'spreadsheet'},
        sql: {name: 'sql', mime: 'text/x-sql'},
        squirrel: {name: 'clike', mime: 'text/x-squirrel'},
        stylus: {name: 'stylus'},
        swift: {name: 'swift'},
        tcl: {name: 'tcl'},
        text: {name: 'doku-null'},
        textile: {name: 'textile'},
        tiddlywiki: {name: 'tiddlywiki'},
        tiki: {name: 'tiki'},
        toml: {name: 'toml'},
        tornado: {name: 'tornado', deps: ['htmlmixed']},
        troff: {name: 'troff'},
        ttcn: {name: 'ttcn', mime: 'text/x-ttcn'},
        'ttcn-cfg': {name: 'ttcn-cfg', mime: 'text/x-ttcn-cfg'},
        turtle: {name: 'turtle'},
        twig: {name: 'twig'},
        typescript: {name: 'javascript', mime: 'application/typescript'},
        vbnet: {name: 'vb'},
        vbscript: {name: 'vbscript'},
        velocity: {name: 'velocity'},
        verilog: {name: 'verilog'},
        vhdl: {name: 'vhdl'},
        vue: {name: 'vue'},
        webidl: {name: 'webidl'},
        xml: {name: 'xml'},
        xquery: {name: 'xquery'},
        xu: {name: 'mscgen', mime: 'text/x-xu'},
        yacas: {name: 'yacas'},
        yaml: {name: 'yaml'},
        'yaml-frontmatter': {name: 'yaml-frontmatter', deps: ['gfm']},
        z80: {name: 'z80'},
    };

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
                    cm.setOption('mode', value === '1' ? dokuMode : 'null');
                }
            }
        },
        theme: {
            default_: 'default',
            choices: [
                '3024-day',
                '3024-night',
                'abcdef',
                'ambiance',
                'ambiance-mobile',
                'base16-dark',
                'base16-light',
                'bespin',
                'blackboard',
                'cobalt',
                'colorforth',
                'default',
                'dracula',
                'eclipse',
                'elegant',
                'erlang-dark',
                'hopscotch',
                'icecoder',
                'isotope',
                'lesser-dark',
                'material',
                'mbo',
                'mdn-like',
                'midnight',
                'monokai',
                'neat',
                'neo',
                'night',
                'paraiso-dark',
                'paraiso-light',
                'pastel-on-dark',
                'railscasts',
                'rubyblue',
                'seti',
                'solarized',
                'the-matrix',
                'tomorrow-night-bright',
                'tomorrow-night-eighties',
                'ttcn',
                'twilight',
                'vibrant-ink',
                'xq-dark',
                'xq-light',
                'yeti',
                'zenburn',
            ],
            callback: function(value) {
                if (cm) {
                    cm.setOption('theme', value);
                }
            }
        },
    };

    var textarea = jQuery('#wiki__text');

    CodeMirror.modeURL = url('/dist/modes/%N.min.js');

    if (textarea.length) {
        initMode();
        initHooks();
        initSettingsMenu();

        if (getSetting('nativeeditor') === '0') {
            initCodeMirror();
        }
    }

    if (JSINFO.plugin_codemirror.codesyntax.toString() === '1') {
        jQuery('#dokuwiki__content pre.code').each(function(index, element) {
            var classNames = element.className.split(' ');
            jQuery.each(classNames, function(index, className) {
                if (!codeModes[className]) {
                    return;
                }
                element.className = element.className + ' cm-s-default';
                var mode = codeModes[className];
                var value = jQuery(element).text();
                var spec = mode.options || {};
                spec.name = mode.mime || mode.name;
                getCodeMode(className, {}, function() {
                    CodeMirror.runMode(value, spec, element);
                });
                CodeMirror.runMode(value, spec, element);
            });
        });
    }

    function getCodeMode(lang, options, onLoadedAsync) {
        var mode = codeModes[lang] || {name: 'doku-null'};
        var deps = [mode.name].concat(mode.deps || []);
        var loadNextDep = function() {
            if (deps.length > 0) {
                CodeMirror.requireMode(deps.pop(), loadNextDep);
            } else {
                onLoadedAsync();
            }
        };
        do {
            var dep = deps.pop();
            if (!CodeMirror.modes.hasOwnProperty(dep)) {
                CodeMirror.requireMode(dep, loadNextDep);
                return CodeMirror.getMode(options, {name: 'doku-null'});
            }
        } while (deps.length > 0);

        var spec = mode.options || {};
        spec.name = mode.mime || mode.name;

        return CodeMirror.getMode(options, spec);
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
        cm.getDoc().on('change', function() {
            var now = new Date();
            if (now.getTime() - dw_locktimer.lasttime.getTime() > 30000) {
                textarea.val(cm.getDoc().getValue());
                dw_locktimer.refresh();
            }
        });
        jQuery.each(settings, function(name, setting) {
            if (name !== 'nativeeditor') {
                var value = getSetting(name);
                setting.callback(value);
            }
        });
        window.DWsetSelection(selection);
    }

    function initMode() {
        dokuMode = JSINFO.plugin_codemirror;

        dokuMode.name = 'doku';

        dokuMode.loadMode = function(lang) {
            var onLoadedAsync = function() {
                // Reset syntax highlighting
                cm.setOption('mode', dokuMode);
            };
            return getCodeMode(lang, cm.options, onLoadedAsync);
        };

        dokuMode.validLang = function(lang) {
            return codeModes[lang] !== undefined;
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
        var intervalID;

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

        intervalID = setInterval(check, 200);
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
