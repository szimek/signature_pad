import * as esbuild from 'esbuild';
import { umdWrapper } from 'esbuild-plugin-umd-wrapper';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

const version = process.env.SEMANTIC_RELEASE_NEXT_VERSION || pkg.version;
console.log('building version:', version);

const banner =
  '/*!\n' +
  ` * Signature Pad v${version} | ${pkg.homepage}\n` +
  ` * (c) ${new Date().getFullYear()} ${
    pkg.author.name
  } | Released under the MIT license\n` +
  ' */\n';

function config(options) {
  return {
    banner: {
      js: banner,
    },
    sourcemap: true,
    bundle: true,
    minify: true,
    ...(options.format === 'umd'
      ? {
        stdin: {
          contents: 'module.exports = require("./src/signature_pad.ts").default',
          resolveDir: '.',
        },
        plugins: [umdWrapper({
          libraryName: 'SignaturePad',
        })],
      }
      : {
        entryPoints: ['src/signature_pad.ts'],
      }),
    ...options,
  };
}

await esbuild.build(config({
  format: 'esm',
  outfile: 'dist/signature_pad.min.js',
}));

await esbuild.build(config({
  format: 'esm',
  outfile: 'dist/signature_pad.js',
  minify: false,
}));

await esbuild.build(config({
  format: 'umd',
  outfile: 'dist/signature_pad.umd.min.js',
}));

await esbuild.build(config({
  format: 'umd',
  outfile: 'dist/signature_pad.umd.js',
  minify: false,
}));
