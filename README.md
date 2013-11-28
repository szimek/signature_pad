Signature Pad [![Code Climate](https://codeclimate.com/github/szimek/signature_pad.png)](https://codeclimate.com/github/szimek/signature_pad)
=============

Signature Pad is a JavaScript library for drawing smooth signatures. It's HTML5 canvas based and uses variable width Bézier curve interpolation based on [Smoother Signatures](http://corner.squareup.com/2012/07/smoother-signatures.html) post by [Square](https://squareup.com).
It works in all modern desktop and mobile browsers and doesn't depend on any external libraries.

![Example](https://f.cloud.github.com/assets/9873/268046/9ced3454-8efc-11e2-816e-a9b170a51004.png)

## Demo
[Demo](http://szimek.github.io/signature_pad) works in desktop and mobile browsers. You can check out its [source code](https://github.com/szimek/signature_pad/blob/gh-pages/js/app.js) for some tips on how to handle window resize and high DPI screens. You can also find more about the latter in [HTML5 Rocks tutorial](http://www.html5rocks.com/en/tutorials/canvas/hidpi).

## Usage
``` javascript
var canvas = document.querySelector("canvas");

var signaturePad = new SignaturePad(canvas);

// Returns signature image as data URL
signaturePad.toDataURL();

// Draws signature image from data URL
signaturePad.fromDataURL("data:image/png;base64,iVBORw0K...");

// Clears the canvas
signaturePad.clear();

// Returns true if canvas is empty, otherwise returns false
signaturePad.isEmpty();
```

### Handling data URI encoded images on the server side
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

## Changelog
### 1.2.4
* Fix bug where stroke becomes very thin. [mvirkkunen](https://github.com/mvirkkunen)

### 1.2.3
* Fix `SignaturePad#fromDataURL` on Firefox. [Fr3nzzy](https://github.com/Fr3nzzy)

### 1.2.2
* Make `SignaturePad#isEmpty` return false after loading an image using `SignaturePad#fromDataURL`. [krisivanov](https://github.com/krisivanov)

### 1.2.1
* Fixed `SignaturePad#clear()`.

### 1.2.0
* Add `backgroundColor` option to set custom color of the background on `SignaturePad#clear()`.
* Rename `color` option to `penColor`.
* Fix passing arguments to canvas element on `SignaturePad#toDataURL()`.

## License
Released under the [MIT License](http://www.opensource.org/licenses/MIT).
