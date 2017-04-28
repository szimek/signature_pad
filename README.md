# Signature Pad [![npm](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=2.1.1&x2=0)](https://www.npmjs.com/package/signature_pad) [![Code Climate](https://codeclimate.com/github/szimek/signature_pad.png)](https://codeclimate.com/github/szimek/signature_pad)


Signature Pad is a JavaScript library for drawing smooth signatures. It's HTML5 canvas based and uses variable width Bézier curve interpolation based on [Smoother Signatures](http://corner.squareup.com/2012/07/smoother-signatures.html) post by [Square](https://squareup.com).
It works in all modern desktop and mobile browsers and doesn't depend on any external libraries.

![Example](https://f.cloud.github.com/assets/9873/268046/9ced3454-8efc-11e2-816e-a9b170a51004.png)

## Demo
[Demo](http://szimek.github.io/signature_pad) works in desktop and mobile browsers. You can check out its [source code](https://github.com/szimek/signature_pad/blob/gh-pages/js/app.js) for some tips on how to handle window resize and high DPI screens. You can also find more about the latter in [HTML5 Rocks tutorial](http://www.html5rocks.com/en/tutorials/canvas/hidpi).

## Installation
You can install the latest release using npm:
```bash
npm install --save signature_pad
```
or Yarn:
```bash
yarn add signature_pad
```
or Bower:
```bash
bower install signature_pad
```
You can also add it directly to your page using `<script>` tag:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/signature_pad/1.5.3/signature_pad.min.js"></script>
```
You can select a different version at [https://cdnjs.com/libraries/signature_pad](https://cdnjs.com/libraries/signature_pad).

This library is provided as UMD (Universal Module Definition) and ES6 module.

**NOTE** When importing this library in TypeScript, one needs to use the following syntax:
```js
import * as SignaturePad from 'signature_pad';
```
For more info why it's needed, check these 2 issues: [TypeScript#13017](https://github.com/Microsoft/TypeScript/issues/13017) and [rollup#1156](https://github.com/rollup/rollup/issues/1156).

## Usage
### API
``` javascript
var canvas = document.querySelector("canvas");

var signaturePad = new SignaturePad(canvas);

// Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible parameters)
signaturePad.toDataURL(); // save image as PNG
signaturePad.toDataURL("image/jpeg"); // save image as JPEG
signaturePad.toDataURL("image/svg+xml"); // save image as SVG

// Draws signature image from data URL
signaturePad.fromDataURL("data:image/png;base64,iVBORw0K...");

// Returns signature image as an array of point groups
const data = signaturePad.toData();

// Draws signature image from an array of point groups
signaturePad.fromData(data);

// Clears the canvas
signaturePad.clear();

// Returns true if canvas is empty, otherwise returns false
signaturePad.isEmpty();

// Unbinds all event handlers
signaturePad.off();

// Rebinds all event handlers
signaturePad.on();
```

### Options
<dl>
<dt>dotSize</dt>
<dd>(float or function) Radius of a single dot.</dd>
<dt>minWidth</dt>
<dd>(float) Minimum width of a line. Defaults to <code>0.5</code>.</dd>
<dt>maxWidth</dt>
<dd>(float) Maximum width of a line. Defaults to <code>2.5</code>.</dd>
<dt>throttle</dt>
<dd>(integer) Draw the next point at most once per every <code>x</code> milliseconds. Set it to <code>0</code> to turn off throttling. Defaults to <code>16</code>.</dd>
<dt>backgroundColor</dt>
<dd>(string) Color used to clear the background. Can be any color format accepted by <code>context.fillStyle</code>. Defaults to <code>"rgba(0,0,0,0)"</code> (transparent black). Use a non-transparent color e.g. <code>"rgb(255,255,255)"</code> (opaque white) if you'd like to save signatures as JPEG images.</dd>
<dt>penColor</dt>
<dd>(string) Color used to draw the lines. Can be any color format accepted by <code>context.fillStyle</code>. Defaults to <code>"black"</code>.</dd>
<dt>velocityFilterWeight</dt>
<dd>(float) Weight used to modify new velocity based on the previous velocity. Defaults to <code>0.7</code>.</dd>
<dt>onBegin</dt>
<dd>(function) Callback when stroke begin.</dd>
<dt>onEnd</dt>
<dd>(function) Callback when stroke end.</dd>
</dl>

You can set options during initialization:
```javascript
var signaturePad = new SignaturePad(canvas, {
    minWidth: 5,
    maxWidth: 10,
    penColor: "rgb(66, 133, 244)"
});
```
or during runtime:
```javascript
var signaturePad = new SignaturePad(canvas);
signaturePad.minWidth = 5;
signaturePad.maxWidth = 10;
signaturePad.penColor = "rgb(66, 133, 244)";
```


### Tips and tricks
#### Handling high DPI screens
To correctly handle canvas on low and high DPI screens one has to take `devicePixelRatio` into account and scale the canvas accordingly. This scaling is also necessary to properly display signatures loaded via `SignaturePad#fromDataURL`. Here's an example how it can be done:
```javascript
function resizeCanvas() {
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear(); // otherwise isEmpty() might return incorrect value
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
```
Instead of `resize` event you can listen to screen orientation change, if you're using this library only on mobile devices. You can also throttle the `resize` event - you can find some examples on [this MDN page](https://developer.mozilla.org/en-US/docs/Web/Events/resize).

When you modify width or height of a canvas, it will be automatically cleared by the browser. SignaturePad doesn't know about it by itself, so you can call `signaturePad.clear()` to make sure that `signaturePad.isEmpty()` returns correct value in this case.

This clearing of the canvas by the browser can be annoying, especially on mobile devices e.g. when screen orientation is changed. There are a few workarounds though, e.g. you can [lock screen orientation](https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation), or read an image from the canvas before resizing it and write the image back after.

#### Handling data URI encoded images on the server side
If you are not familiar with data URI scheme, you can read more about it on [Wikipedia](http://en.wikipedia.org/wiki/Data_URI_scheme).

There are 2 ways you can handle data URI encoded images.

You could simply store it in your database as a string and display it in HTML like this:

``` html
<img src="data:image/png;base64,iVBORw0K..." />
```

but this way has many disadvantages - it's not easy to get image dimensions, you can't manipulate it e.g. to create a thumbnail and it also [has some performance issues on mobile devices](http://www.mobify.com/blog/data-uris-are-slow-on-mobile/).

Thus, more common way is to decode it and store as a file. Here's an example in Ruby:

``` ruby
require "base64"

data_uri = "data:image/png;base64,iVBORw0K..."
encoded_image = data_uri.split(",")[1]
decoded_image = Base64.decode64(encoded_image)
File.open("signature.png", "wb") { |f| f.write(decoded_image) }
```

Here's an example in PHP:

``` php
$data_uri = "data:image/png;base64,iVBORw0K...";
$encoded_image = explode(",", $data_uri)[1];
$decoded_image = base64_decode($encoded_image);
file_put_contents("signature.png", $decoded_image);
```

#### Removing empty space around a signature
If you'd like to remove (trim) empty space around a signature, you can do it on the server side or the client side. On the server side you can use e.g. ImageMagic and its `trim` option: `convert -trim input.jpg output.jpg`. If you don't have access to the server, or just want to trim the image before submitting it to the server, you can do it on the client side as well. There are a few examples how to do it, e.g. [here](https://github.com/szimek/signature_pad/issues/49#issue-29108215) or [here](https://github.com/szimek/signature_pad/issues/49#issuecomment-260976909) and there's also a tiny library [trim-canvas](https://github.com/agilgur5/trim-canvas) that provides this functionality.

#### Drawing over an image
Demo: <https://jsfiddle.net/szimek/d6a78gwq/>

## License
Released under the [MIT License](http://www.opensource.org/licenses/MIT).
