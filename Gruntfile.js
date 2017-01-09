/* eslint func-names: "off" */
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      target: [
        'Gruntfile.js',
        'src/signature_pad.js',
      ],
    },

    babel: {
      options: {
        plugins: [['transform-es2015-modules-umd', {
          exactGlobals: true,
          globals: { signature_pad: 'SignaturePad' },
        }]],
        presets: ['es2015'],
      },
      dist: {
        files: {
          'dist/signature_pad.js': ['src/signature_pad.js'],
        },
      },
    },

    uglify: {
      dist: {
        options: {
          preserveComments: false,
        },
        files: {
          'dist/signature_pad.min.js': ['dist/signature_pad.js'],
        },
      },
    },

    banner: {
      dev: {
        options: {
          banner: '/*!\n' +
            ' * Signature Pad v<%= pkg.version %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' *\n' +
            " * Copyright <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
            ' * Released under the MIT license\n' +
            ' *\n' +
            ' * The main idea and some parts of the code (e.g. drawing variable width Bézier curve) are taken from:\n' +
            ' * http://corner.squareup.com/2012/07/smoother-signatures.html\n' +
            ' *\n' +
            ' * Implementation of interpolation using cubic Bézier curves is taken from:\n' +
            ' * http://benknowscode.wordpress.com/2012/09/14/path-interpolation-using-cubic-bezier-and-control-point-estimation-in-javascript\n' +
            ' *\n' +
            ' * Algorithm for approximated length of a Bézier curve is taken from:\n' +
            ' * http://www.lemoda.net/maths/bezier-length/index.html\n' +
            ' *\n' +
            ' */\n',
        },
        files: {
          'dist/signature_pad.js': ['dist/signature_pad.js'],
        },
      },
      dist: {
        options: {
          banner: '/*!\n' +
            ' * Signature Pad v<%= pkg.version %> | <%= pkg.homepage %>\n' +
            " * (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %> | Released under the MIT license\n" +
            ' */\n',
        },
        files: {
          'dist/signature_pad.min.js': ['dist/signature_pad.min.js'],
        },
      },
    },

  });

  grunt.registerMultiTask('banner', 'Add banner to files.', function () {
    const options = this.options({
      banner: '',
    });

    const banner = grunt.template.process(options.banner);

    this.files.forEach((f) => {
      let output = grunt.file.read(f.src);
      output = banner + output;
      grunt.file.write(f.dest, output);
    });
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'eslint',
    'babel',
    'uglify',
    'banner',
  ]);
};
