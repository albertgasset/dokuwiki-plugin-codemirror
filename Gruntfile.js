/* jshint node: true */
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
                    'dist/**/*.css',
                    'dist/**/*.js',
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
                sourceMap: true,
            },
            keymaps: {
                files: [{
                    expand: true,
                    cwd: 'codemirror/keymap',
                    src: '*.js',
                    dest: 'dist/keymaps',
                    ext: '.min.js',
                }],
            },
            modes: {
                files: [{
                    expand: true,
                    cwd: 'codemirror/mode',
                    src: ['*/*.js', '!*/*test.js'],
                    dest: 'dist/modes',
                    ext: '.min.js',
                    flatten: true,
                }],
            },
            scripts: {
                dest: 'dist/scripts.min.js',
                src: [
                    'codemirror/lib/codemirror.js',
                    'codemirror/addon/dialog/dialog.js',
                    'codemirror/addon/edit/closebrackets.js',
                    'codemirror/addon/edit/matchbrackets.js',
                    'codemirror/addon/mode/loadmode.js',
                    'codemirror/addon/mode/overlay.js',
                    'codemirror/addon/search/searchcursor.js',
                    'codemirror/addon/search/search.js',
                    'codemirror/addon/selection/active-line.js',
                    'mode.js',
                    'init.js',
                ],
            },
        },
        watch: {
            keymaps: {
                files: 'codemirror/keymap/*.js',
                tasks: ['uglify:keymaps'],
            },
            modes: {
                files: 'codemirror/mode/*/*.js',
                tasks: ['uglify:modes'],
            },
            scripts: {
                files: '<%= uglify.scripts.src %>',
                tasks: ['uglify:scripts'],
            },
            less: {
                files: ['<%= less.styles.src %>', 'codemirror/**/*.css'],
                tasks: ['less'],
            },
        },
    });
};
