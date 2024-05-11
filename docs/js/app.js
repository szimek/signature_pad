const wrapper = document.getElementById("signature-pad");
const canvasWrapper = document.getElementById("canvas-wrapper");
const clearButton = wrapper.querySelector("[data-action=clear]");
const changeBackgroundColorButton = wrapper.querySelector("[data-action=change-background-color]");
const changeColorButton = wrapper.querySelector("[data-action=change-color]");
const changeWidthButton = wrapper.querySelector("[data-action=change-width]");
const undoButton = wrapper.querySelector("[data-action=undo]");
const redoButton = wrapper.querySelector("[data-action=redo]");
const savePNGButton = wrapper.querySelector("[data-action=save-png]");
const saveJPGButton = wrapper.querySelector("[data-action=save-jpg]");
const saveSVGButton = wrapper.querySelector("[data-action=save-svg]");
const saveSVGWithBackgroundButton = wrapper.querySelector("[data-action=save-svg-with-background]");
const openInWindowButton = wrapper.querySelector("[data-action=open-in-window]");
let undoData = [];
const canvas = wrapper.querySelector("canvas");
const signaturePad = new SignaturePad(canvas, {
  // It's Necessary to use an opaque color when saving image as JPEG;
  // this option can be omitted if only saving as PNG or SVG
  backgroundColor: 'rgb(255, 255, 255)'
});

function randomColor() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
function resizeCanvas() {
  // When zoomed out to less than 100%, for some very strange reason,
  // some browsers report devicePixelRatio as less than 1
  // and only part of the canvas is cleared then.
  const ratio = Math.max(window.devicePixelRatio || 1, 1);

  // This part causes the canvas to be cleared
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);

  // This library does not listen for canvas changes, so after the canvas is automatically
  // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
  // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
  // that the state of this library is consistent with visual state of the canvas, you
  // have to clear it manually.
  //signaturePad.clear();

  // If you want to keep the drawing on resize instead of clearing it you can reset the data.
  signaturePad.fromData(signaturePad.toData());
}

// On mobile devices it might make more sense to listen to orientation change,
// rather than window resize events.
window.onresize = resizeCanvas;
resizeCanvas();

window.addEventListener("keydown", (event) => {
  switch (true) {
    case event.key === "z" && event.ctrlKey:
      undoButton.click();
      break;
    case event.key === "y" && event.ctrlKey:
      redoButton.click();
      break;
  }
});

function download(dataURL, filename) {
  const blob = dataURLToBlob(dataURL);
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.style = "display: none";
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
}

// One could simply use Canvas#toBlob method instead, but it's just to show
// that it can be done using result of SignaturePad#toDataURL.
function dataURLToBlob(dataURL) {
  // Code taken from https://github.com/ebidel/filer.js
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

signaturePad.addEventListener("endStroke", () => {
  // clear undoData when new data is added
  undoData = [];
});

clearButton.addEventListener("click", () => {
  signaturePad.clear();
});

undoButton.addEventListener("click", () => {
  const data = signaturePad.toData();

  if (data && data.length > 0) {
    // remove the last dot or line
    const removed = data.pop();
    undoData.push(removed);
    signaturePad.fromData(data);
  }
});

redoButton.addEventListener("click", () => {
  if (undoData.length > 0) {
    const data = signaturePad.toData();
    data.push(undoData.pop());
    signaturePad.fromData(data);
  }
});

changeBackgroundColorButton.addEventListener("click", () => {
  signaturePad.backgroundColor = randomColor();
  const data = signaturePad.toData();
  signaturePad.clear();
  signaturePad.fromData(data);
});

changeColorButton.addEventListener("click", () => {
  signaturePad.penColor = randomColor();
});

changeWidthButton.addEventListener("click", () => {
  const min = Math.round(Math.random() * 100) / 10;
  const max = Math.round(Math.random() * 100) / 10;

  signaturePad.minWidth = Math.min(min, max);
  signaturePad.maxWidth = Math.max(min, max);
});

savePNGButton.addEventListener("click", () => {
  if (signaturePad.isEmpty()) {
    alert("Please provide a signature first.");
  } else {
    const dataURL = signaturePad.toDataURL();
    download(dataURL, "signature.png");
  }
});

saveJPGButton.addEventListener("click", () => {
  if (signaturePad.isEmpty()) {
    alert("Please provide a signature first.");
  } else {
    const dataURL = signaturePad.toDataURL("image/jpeg");
    download(dataURL, "signature.jpg");
  }
});

saveSVGButton.addEventListener("click", () => {
  if (signaturePad.isEmpty()) {
    alert("Please provide a signature first.");
  } else {
    const dataURL = signaturePad.toDataURL('image/svg+xml');
    download(dataURL, "signature.svg");
  }
});

saveSVGWithBackgroundButton.addEventListener("click", () => {
  if (signaturePad.isEmpty()) {
    alert("Please provide a signature first.");
  } else {
    const dataURL = signaturePad.toDataURL('image/svg+xml', { includeBackgroundColor: true });
    download(dataURL, "signature.svg");
  }
});

openInWindowButton.addEventListener("click", () => {
	var externalWin = window.open('', '', `width=${canvas.width / window.devicePixelRatio},height=${canvas.height / window.devicePixelRatio}`);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  externalWin.onresize = resizeCanvas;
  externalWin.document.body.style.margin = '0';
	externalWin.document.body.appendChild(canvas);
  canvasWrapper.classList.add("empty");
  externalWin.onbeforeunload = () => {
    canvas.style.width = "";
    canvas.style.height = "";
    canvasWrapper.classList.remove("empty");
    canvasWrapper.appendChild(canvas);
    resizeCanvas();
  };
})
