/*jslint node: true */

'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'signature_pad.js'
            ]
        },

        uglify: {
            options: {
                banner: "/*!\n" +
                        " * Signature Pad v<%= pkg.version %> | <%= pkg.homepage %>\n" +
                        " * (c) 2013 Szymon Nowak | Released under the MIT license\n" +
                        " */\n"
            },
            build: {
                files: {
                    'signature_pad.min.js': [
                        'signature_pad.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
        'jshint',
        'uglify'
    ]);
};
