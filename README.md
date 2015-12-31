Signature Pad [![Code Climate](https://codeclimate.com/github/szimek/signature_pad.png)](https://codeclimate.com/github/szimek/signature_pad)
=============

Signature Pad is a JavaScript library for drawing smooth signatures. It's HTML5 canvas based and uses variable width Bézier curve interpolation based on [Smoother Signatures](http://corner.squareup.com/2012/07/smoother-signatures.html) post by [Square](https://squareup.com).
It works in all modern desktop and mobile browsers and doesn't depend on any external libraries.

![Example](https://f.cloud.github.com/assets/9873/268046/9ced3454-8efc-11e2-816e-a9b170a51004.png)

## Demo
[Demo](http://szimek.github.io/signature_pad) works in desktop and mobile browsers. You can check out its [source code](https://github.com/szimek/signature_pad/blob/gh-pages/js/app.js) for some tips on how to handle window resize and high DPI screens. You can also find more about the latter in [HTML5 Rocks tutorial](http://www.html5rocks.com/en/tutorials/canvas/hidpi).

## Installation
You can install the latest release using [Bower](http://bower.io/) - `bower install signature_pad`.

You can also download the latest release from GitHub [releases page](https://github.com/szimek/signature_pad/releases) or go to the latest release tag (e.g. [v1.5.2](https://github.com/szimek/signature_pad/tree/v1.5.2)) and download  `signature_pad.js` or `signature_pad.min.js` files directly.

The master branch can contain undocumented or backward compatibility breaking changes.

## Usage
### API
``` javascript
var canvas = document.querySelector("canvas");

var signaturePad = new SignaturePad(canvas);

// Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible paramters)
signaturePad.toDataURL(); // save image as PNG
signaturePad.toDataURL("image/jpeg"); // save image as JPEG

// Draws signature image from data URL
signaturePad.fromDataURL("data:image/png;base64,iVBORw0K...");

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
$data_pieces = explode(",", $data_uri);
$encoded_image = $data_pieces[1];
$decoded_image = base64_decode($encoded_image);
file_put_contents( "signature.png",$decoded_image);
```

### Removing empty space around a signature
If you'd like to remove (trim) empty space around a signature, you can do it on the server side or the client side. On the server side you can use e.g. ImageMagic and its `trim` option: `convert -trim input.jpg output.jpg`. If you don't have access to the server, or just want to trim the image before submitting it to the server, you can do it on the client side as well. Here's an example: https://github.com/szimek/signature_pad/issues/49#issue-29108215.

## License
Released under the [MIT License](http://www.opensource.org/licenses/MIT).
