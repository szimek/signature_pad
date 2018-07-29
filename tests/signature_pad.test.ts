import SignaturePad from "../src/signature_pad";
import { json, dataURL } from "./fixtures/face";

let canvas: HTMLCanvasElement;

beforeAll(() => {
  canvas = document.createElement('canvas');
  canvas.setAttribute("width", "300");
  canvas.setAttribute("height", "150");
})

describe("#constructor", () => {
  it("returns an instance of SignaturePad", () => {
    const pad = new SignaturePad(canvas);

    expect(pad).toBeInstanceOf(SignaturePad);
  });

  it("allows to set 'throttle' to 0", () => {
    const pad = new SignaturePad(canvas, { throttle: 0 });

    expect(pad.throttle).toBe(0);
  });

  it("allows to set 'minDistance' to 0", () => {
    const pad = new SignaturePad(canvas, { minDistance: 0 });

    expect(pad.minDistance).toBe(0);
  });
});

describe("#clear", () => {
  it.skip("clears canvas", () => {});

  it("clears data structures", () => {
    const pad = new SignaturePad(canvas);

    pad.fromData(json);
    expect(pad.isEmpty()).toBe(false);

    pad.clear();

    expect(pad.isEmpty()).toBe(true);
    expect(pad.toData()).toEqual([]);
  });
});

describe("#isEmpty", () => {
  it("returns true if pad is empty", () => {
    const pad = new SignaturePad(canvas);

    expect(pad.isEmpty()).toBe(true);
  });

  it("returns false if pad is not empty", () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(json);

    expect(pad.isEmpty()).toBe(false);
  });
});

describe("#fromData", () => {});

describe("#toData", () => {
  it("returns JSON with point groups", () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(json);

    expect(pad.toData()).toEqual(json);
  });
});

describe("#fromDataURL", () => {});

describe("#toDataURL", () => {
  // Unfortunately, results of Canvas#toDataURL depend on a platform :/
  it.skip("returns PNG image in data URL format", () => {});

  // Synchronous Canvas#toDataURL for JPEG images is not supported by 'canvas' library :/
  it.skip("returns JPG image in data URL format", () => {});

  it("returns SVG image in data URL format", () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(json);

    expect(pad.toDataURL('image/svg+xml')).toEqual(dataURL.svg);
  });
});
