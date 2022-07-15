const wrapper = document.getElementById("signature-pad");
const clearButton = wrapper.querySelector("[data-action=clear]");
const changeColorButton = wrapper.querySelector("[data-action=change-color]");
const undoButton = wrapper.querySelector("[data-action=undo]");
const savePNGButton = wrapper.querySelector("[data-action=save-png]");
const saveJPGButton = wrapper.querySelector("[data-action=save-jpg]");
const saveSVGButton = wrapper.querySelector("[data-action=save-svg]");
const canvas = wrapper.querySelector("canvas");
const signaturePad = new SignaturePad(canvas, {
  // It's Necessary to use an opaque color when saving image as JPEG;
  // this option can be omitted if only saving as PNG or SVG
  backgroundColor: 'rgb(255, 255, 255)'
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

clearButton.addEventListener("click", () => {
  signaturePad.clear();
});

undoButton.addEventListener("click", () => {
  const data = signaturePad.toData();

  if (data) {
    data.pop(); // remove the last dot or line
    signaturePad.fromData(data);
  }
});

changeColorButton.addEventListener("click", () => {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  const color = "rgb(" + r + "," + g + "," + b +")";

  signaturePad.penColor = color;
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
