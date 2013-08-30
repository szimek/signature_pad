Signature Pad
=============

HTML5 canvas based smooth signature drawing using variable width Bézier curve interpolation based on [Smoother Signatures](http://corner.squareup.com/2012/07/smoother-signatures.html) post by [Square](https://squareup.com).

Demo (works on desktop and mobile browsers) at http://szimek.github.io/signature_pad.

Example:

![Example](https://f.cloud.github.com/assets/9873/268046/9ced3454-8efc-11e2-816e-a9b170a51004.png)

## Usage

``` javascript
var canvas = document.querySelector("canvas");

var signaturePad = new SignaturePad(canvas);
signaturePad.toDataURL(); // Returns signature image as data URL
signaturePad.fromDataURL("data:image/png;base64,iVBORw0K...") // Draws signature image from data URL
signaturePad.clear();     // Clears the canvas
signaturePad.isEmpty();   // Returns true if canvas is empty, otherwise returns false
```

You can check out [demo source code](https://github.com/szimek/signature_pad/blob/gh-pages/js/app.js) for more details.

## License

Released under the [MIT License](http://www.opensource.org/licenses/MIT).
