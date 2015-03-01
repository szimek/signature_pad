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
                'src/signature_pad.js'
            ]
        },

        banner: {
            dev: {
                options: {
                    banner: "/*!\n" +
                            " * Signature Pad v<%= pkg.version %>\n" +
                            " * <%= pkg.homepage %>\n" +
                            " *\n" +
                            " * Copyright <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
                            " * Released under the MIT license\n" +
                            " *\n" +
                            " * The main idea and some parts of the code (e.g. drawing variable width Bézier curve) are taken from:\n" +
                            " * http://corner.squareup.com/2012/07/smoother-signatures.html\n" +
                            " *\n" +
                            " * Implementation of interpolation using cubic Bézier curves is taken from:\n" +
                            " * http://benknowscode.wordpress.com/2012/09/14/path-interpolation-using-cubic-bezier-and-control-point-estimation-in-javascript\n" +
                            " *\n" +
                            " * Algorithm for approximated length of a Bézier curve is taken from:\n" +
                            " * http://www.lemoda.net/maths/bezier-length/index.html\n" +
                            " *\n" +
                            " */\n"
                },
                files: {
                    'signature_pad.js': ['src/signature_pad.js']
                }
            },
            dist: {
                options: {
                    banner: "/*!\n" +
                        " * Signature Pad v<%= pkg.version %> | <%= pkg.homepage %>\n" +
                        " * (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %> | Released under the MIT license\n" +
                        " */\n"
                },
                files: {
                    'signature_pad.min.js': ['src/signature_pad.js']
                }
            }
        },

        umd: {
          options: {
            objectToExport: 'SignaturePad',
            globalAlias: 'SignaturePad',
            indent: 4
          },
          dev: {
            options: {
              src: 'signature_pad.js',
              dest: 'signature_pad.js'
            }
          },
          dist: {
            options: {
              src: 'signature_pad.min.js',
              dest: 'signature_pad.min.js'
            }
          }
        },

        uglify: {
            dist: {
                options: {
                    preserveComments: 'some'
                },
                files: {
                    'signature_pad.min.js': ['signature_pad.min.js']
                }
            }
        }
    });

    grunt.registerMultiTask('banner', 'Add banner to files.', function () {
        var options = this.options({
            banner: ''
        });

        var banner = grunt.template.process(options.banner);

        this.files.forEach(function (f) {
            var output = grunt.file.read(f.src);
            output = banner + output;
            grunt.file.write(f.dest, output);
        });
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
        'jshint',
        'banner',
        'umd',
        'uglify'
    ]);
};
