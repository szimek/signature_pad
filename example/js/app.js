var wrapper = document.getElementById("signature-pad"),
    clearButton = wrapper.querySelector("[data-action=clear]"),
    savePNGButton = wrapper.querySelector("[data-action=save-png]"),
    saveSVGButton = wrapper.querySelector("[data-action=save-svg]"),
    canvas = wrapper.querySelector("canvas"),
    signaturePad = new SignaturePad(canvas, { crop: true });

// Adjust canvas coordinate space.
// This also causes canvas to be cleared
// if the image does not fit after resizing.
function resizeCanvas() {
    signaturePad.resize(canvas.offsetWidth, canvas.offsetHeight, false);
}

window.onresize = resizeCanvas;
resizeCanvas();

clearButton.addEventListener("click", function (event) {
  signaturePad.clear();
});

savePNGButton.addEventListener("click", function (event) {
    if (signaturePad.isEmpty()) {
        alert("Please provide signature first.");
    } else {
        window.open(signaturePad.toDataURL());
    }
});

saveSVGButton.addEventListener("click", function (event) {
    if (signaturePad.isEmpty()) {
        alert("Please provide signature first.");
    } else {
        window.open(signaturePad.toDataURL('image/svg+xml'));
    }
});
