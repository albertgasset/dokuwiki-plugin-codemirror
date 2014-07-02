module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('dev', ['clean', 'cssmin', 'uglify', 'watch']);
    grunt.registerTask('dist', ['jshint', 'clean', 'cssmin', 'uglify']);

    grunt.initConfig({
        clean: {
            dist: ['dist'],
        },
        cssmin: {
            styles: {
                dest: 'dist/styles.min.css',
                src: [
                    'codemirror/lib/codemirror.css',
                    'codemirror/addon/dialog/dialog.css',
                    'styles.css',
                ],
            },
            themes: {
                files: [{
                    expand: true,
                    cwd: 'codemirror/theme',
                    src: '*.css',
                    dest: 'dist/themes',
                    ext: '.min.css',
                }],
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
                    src: ['*/*.js', '!*/test.js'],
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
            styles: {
                files: '<%= cssmin.styles.src %>',
                tasks: ['cssmin:styles'],
            },
            themes: {
                files: 'codemirror/theme/*.css',
                tasks: ['cssmin:themes'],
            },
        },
    });
};
