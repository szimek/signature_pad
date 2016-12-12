var wrapper = document.getElementById("signature-pad"),
    clearButton = wrapper.querySelector("[data-action=clear]"),
    undoButton = wrapper.querySelector("[data-action=undo]"),
    saveButton = wrapper.querySelector("[data-action=save]"),
    canvas = wrapper.querySelector("canvas"),
    signaturePad;

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared if image does not fit anymore.
function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);
    var width = canvas.offsetWidth * ratio;
    var height = canvas.offsetHeight * ratio;
    signaturePad.resize(width, height);
    canvas.getContext("2d").scale(ratio, ratio);
}

signaturePad = new SignaturePad(canvas);

window.onresize = resizeCanvas;
resizeCanvas();

clearButton.addEventListener("click", function (event) {
    signaturePad.clear();
});

undoButton.addEventListener("click", function (event) {
    signaturePad.undo();
});

saveButton.addEventListener("click", function (event) {
    if (signaturePad.isEmpty()) {
        alert("Please provide signature first.");
    } else {
        window.open(signaturePad.toDataURLCropped());
    }
});
