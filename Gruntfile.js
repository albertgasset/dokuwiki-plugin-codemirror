/* jshint node: true, maxlen: 100 */
'use strict';

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'clean', 'less', 'uglify']);
    grunt.registerTask('dev', ['clean', 'less', 'uglify', 'watch']);
    grunt.registerTask('dist', [ 'default', 'compress']);

    grunt.initConfig({
        clean: {
            dist: ['dist'],
        },
        compress: {
            dist: {
                options: {
                    archive: 'dokuwiki-plugin-codemirror.tar.gz',
                },
                src: [
                    'LICENSE',
                    'README',
                    'action.php',
                    'conf/*.php',
                    'dist/**/*.css',
                    'dist/**/*.js',
                    'dist/**/*.map',
                    'lang/**/*.php',
                    'plugin.info.txt',
                    'settings.png',
                ],
                dest: 'codemirror/',
            },
        },
        less: {
            options: {
                compress: true,
                sourceMap: true,
                outputSourceFiles: true,
            },
            styles: {
                dest: 'dist/styles.min.css',
                src: 'styles.less',
            },
        },
        jshint: {
            options: {
                jshintrc: true,
            },
            scripts: {
                src: ['init.js', 'mode.js'],
            },
        },
        uglify: {
            options: {
                compress: false,
                screwIE8: false,
                sourceMap: true,
                sourceMapIncludeSources: true,
            },
            keymaps: {
                files: [{
                    expand: true,
                    cwd: 'node_modules/codemirror/keymap',
                    src: '*.js',
                    dest: 'dist/keymaps',
                    ext: '.min.js',
                }],
            },
            modes: {
                files: [{
                    expand: true,
                    cwd: 'node_modules/codemirror/mode',
                    src: ['*/*.js', '!*/*test.js'],
                    dest: 'dist/modes',
                    ext: '.min.js',
                    extDot: 'last',
                    flatten: true,
                }],
            },
            scripts: {
                dest: 'dist/scripts.min.js',
                src: [
                    'node_modules/codemirror/lib/codemirror.js',
                    'node_modules/codemirror/addon/dialog/dialog.js',
                    'node_modules/codemirror/addon/edit/closebrackets.js',
                    'node_modules/codemirror/addon/edit/matchbrackets.js',
                    'node_modules/codemirror/addon/mode/loadmode.js',
                    'node_modules/codemirror/addon/mode/multiplex.js',
                    'node_modules/codemirror/addon/mode/overlay.js',
                    'node_modules/codemirror/addon/mode/simple.js',
                    'node_modules/codemirror/addon/runmode/runmode.js',
                    'node_modules/codemirror/addon/search/jump-to-line.js',
                    'node_modules/codemirror/addon/search/matchesonscrollbar.js',
                    'node_modules/codemirror/addon/search/searchcursor.js',
                    'node_modules/codemirror/addon/search/search.js',
                    'node_modules/codemirror/addon/selection/active-line.js',
                    'node_modules/codemirror/addon/scroll/annotatescrollbar.js',
                    'node_modules/codemirror/addon/scroll/simplescrollbars.js',
                    'node_modules/cm-show-invisibles/lib/show-invisibles.js',
                    'mode.js',
                    'init.js',
                ],
            },
        },
        watch: {
            keymaps: {
                files: 'node_modules/codemirror/keymap/*.js',
                tasks: ['uglify:keymaps'],
            },
            modes: {
                files: 'node_modules/codemirror/mode/*/*.js',
                tasks: ['uglify:modes'],
            },
            scripts: {
                files: '<%= uglify.scripts.src %>',
                tasks: ['uglify:scripts'],
            },
            less: {
                files: ['<%= less.styles.src %>', 'node_modules/codemirror/**/*.css'],
                tasks: ['less'],
            },
        },
    });
};
