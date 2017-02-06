/* eslint import/no-extraneous-dependencies: 'off' */
const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint');
const uglify = require('rollup-plugin-uglify');

const pkg = require('./package.json');

const plugins = [eslint(), babel()];

const longBanner = '/*!\n' +
  ` * Signature Pad v${pkg.version}\n` +
  ` * ${pkg.homepage}\n` +
  ' *\n' +
  ` * Copyright ${new Date().getFullYear()} ${pkg.author.name}\n` +
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
  ' */\n';

const shortBanner = '/*!\n' +
  ` * Signature Pad v${pkg.version} | ${pkg.homepage}\n` +
  ` * (c) ${new Date().getFullYear()} ${pkg.author.name} | Released under the MIT license\n` +
  ' */\n';

module.exports = [{
  rollup: {
    entry: 'src/signature_pad.js',
    plugins,
  },
  bundle: {
    dest: 'dist/signature_pad.js',
    format: 'umd',
    moduleName: 'SignaturePad',
    banner: longBanner,
  },
}, {
  rollup: {
    entry: 'src/signature_pad.js',
    plugins: [...plugins, uglify()],
  },
  bundle: {
    dest: 'dist/signature_pad.min.js',
    format: 'umd',
    moduleName: 'SignaturePad',
    banner: shortBanner,
  },
}, {
  rollup: {
    entry: 'src/signature_pad.js',
    plugins,
  },
  bundle: {
    dest: 'dist/signature_pad.mjs',
    format: 'es',
    banner: longBanner,
  },
}];
