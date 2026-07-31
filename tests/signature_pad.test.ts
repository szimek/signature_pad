import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import SignaturePad from '../src/signature_pad.js';
import type { Options, PointGroup } from '../src/signature_pad.js';
import { face } from './fixtures/face.js';
import { square } from './fixtures/square.js';

let canvas: HTMLCanvasElement;
const dpr = window.devicePixelRatio;

const twoPointLine: PointGroup[] = [
  {
    penColor: 'black',
    dotSize: 0,
    minWidth: 0.5,
    maxWidth: 2.5,
    velocityFilterWeight: 0.7,
    compositeOperation: 'source-over',
    points: [
      {
        time: 1523730548448,
        x: 20,
        y: 30,
        pressure: 0,
      },
      {
        time: 1523730548657,
        x: 80,
        y: 90,
        pressure: 0,
      },
    ],
  },
];

function changeDevicePixelratio(ratio: number) {
  window.devicePixelRatio = ratio;
  canvas.setAttribute('width', (canvas.width * ratio).toString());
  canvas.setAttribute('height', (canvas.height * ratio).toString());
}

beforeEach(() => {
  window.devicePixelRatio = dpr;
  canvas = document.createElement('canvas');
  canvas.setAttribute('width', '300');
  canvas.setAttribute('height', '150');
});

describe('#constructor', () => {
  it('returns an instance of SignaturePad', () => {
    const pad = new SignaturePad(canvas);

    assert.ok(pad instanceof SignaturePad);
  });

  it("allows to set 'throttle' to 0", () => {
    const pad = new SignaturePad(canvas, { throttle: 0 });

    assert.strictEqual(pad.throttle, 0);
  });

  it("allows to set 'minDistance' to 0", () => {
    const pad = new SignaturePad(canvas, { minDistance: 0 });

    assert.strictEqual(pad.minDistance, 0);
  });

  it("uses fallback values for options with explicit 'undefined'", () => {
    const opts: Options = {
      dotSize: undefined,
      minWidth: undefined,
      maxWidth: undefined,
      penColor: undefined,
      velocityFilterWeight: undefined,
      compositeOperation: undefined,
      minDistance: undefined,
      backgroundColor: undefined,
      throttle: undefined,
      canvasContextOptions: undefined,
    };

    const exp: Options = {
      dotSize: 0,
      minWidth: 0.5,
      maxWidth: 2.5,
      penColor: 'black',
      velocityFilterWeight: 0.7,
      compositeOperation: 'source-over',
      minDistance: 5,
      backgroundColor: 'rgba(0,0,0,0)',
      throttle: 16,
      canvasContextOptions: {},
    };

    const pad = new SignaturePad(canvas, opts);

    const actual = {
      dotSize: pad.dotSize,
      minWidth: pad.minWidth,
      maxWidth: pad.maxWidth,
      penColor: pad.penColor,
      velocityFilterWeight: pad.velocityFilterWeight,
      compositeOperation: pad.compositeOperation,
      minDistance: pad.minDistance,
      backgroundColor: pad.backgroundColor,
      throttle: pad.throttle,
      canvasContextOptions: pad.canvasContextOptions,
    };

    assert.deepStrictEqual(actual, exp);
  });

  it('disables user selection and touch actions on the canvas', () => {
    new SignaturePad(canvas);

    assert.strictEqual(canvas.style.touchAction, 'none');
    assert.strictEqual(canvas.style.userSelect, 'none');
    assert.strictEqual(canvas.style.webkitUserSelect, 'none');
  });
});

describe('#off', () => {
  it('resets canvas styles for touch action and user selection', () => {
    const pad = new SignaturePad(canvas);
    pad.off();

    assert.strictEqual(canvas.style.touchAction, 'auto');
    assert.strictEqual(canvas.style.userSelect, 'auto');
    assert.strictEqual(canvas.style.webkitUserSelect, 'auto');
  });
});

describe('#redraw', () => {
  it('redraws the canvas', (t) => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    pad.redraw();
    t.assert.snapshot(pad.toDataURL('image/svg+xml'));
  });

  it('redraws the dataurl with options', (t) => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    const dataUrl = pad.toDataURL('image/svg+xml');
    pad.clear();
    pad.fromDataURL(dataUrl, { width: 100, height: 100 });
    pad.redraw();
    t.assert.snapshot(
      pad.toDataURL('image/svg+xml', { includeDataUrl: true }),
    );
  });
});

describe('#clear', () => {
  it('clears data structures', () => {
    const pad = new SignaturePad(canvas);

    pad.fromData(face);
    assert.strictEqual(pad.isEmpty(), false);

    pad.clear();

    assert.strictEqual(pad.isEmpty(), true);
    assert.deepStrictEqual(pad.toData(), []);
  });

  it('clear should apply erase option to the canvas context', () => {
    const pad = new SignaturePad(canvas);

    pad.fromData(face);
    assert.strictEqual(pad.isEmpty(), false);

    pad.penColor = 'pink';
    pad.compositeOperation = 'destination-out';

    pad.clear();

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    assert.strictEqual(context.globalCompositeOperation, 'destination-out');
  });
});

describe('#isEmpty', () => {
  it('returns true if pad is empty', () => {
    const pad = new SignaturePad(canvas);

    assert.strictEqual(pad.isEmpty(), true);
  });

  it('returns false if pad is not empty', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    assert.strictEqual(pad.isEmpty(), false);
  });
});

describe('#fromData', () => {
  it('clears the canvas', (t) => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    pad.fromData(square);

    t.assert.snapshot(pad.toDataURL('image/svg+xml'));
  });

  it('does not clear the canvas', (t) => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    pad.fromData(square, { clear: false });

    t.assert.snapshot(pad.toDataURL('image/svg+xml'));
  });

  it('uses point group options to calculate line', () => {
    const pad = new SignaturePad(canvas, {
      penColor: 'black',
      dotSize: 1,
      minWidth: 0.5,
      maxWidth: 2.5,
      velocityFilterWeight: 0.7,
    });
    pad.fromData(face);
    const expected = pad.toDataURL('image/svg+xml');

    pad.clear();
    pad.penColor = 'white';
    pad.dotSize = 2;
    pad.minWidth = 5;
    pad.maxWidth = 10;
    pad.velocityFilterWeight = 0.9;

    pad.fromData(face);
    assert.strictEqual(pad.toDataURL('image/svg+xml'), expected);
  });

  it('draws point groups with two points', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(twoPointLine);
    assert.strictEqual(pad.isEmpty(), false);
  });
});

describe('#toData', () => {
  it('returns JSON with point groups', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    assert.deepStrictEqual(pad.toData(), face);
  });
});

describe('#toDataURL', () => {
  it('returns PNG image by default', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    assert.match(pad.toDataURL(), /^data:image\/png/);
  });

  it('returns PNG image in data URL format', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    assert.match(pad.toDataURL('image/png'), /^data:image\/png/);
  });

  it('returns SVG image in data URL format', (t) => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    t.assert.snapshot(pad.toDataURL('image/svg+xml'));
  });

  it('returns SVG image in data URL format with high DPI', (t) => {
    changeDevicePixelratio(2);
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    t.assert.snapshot(pad.toDataURL('image/svg+xml'));
  });

  it('returns SVG image with backgroundColor', (t) => {
    const pad = new SignaturePad(canvas, { backgroundColor: '#fcc' });
    pad.fromData(face);

    t.assert.snapshot(
      pad.toDataURL('image/svg+xml', { includeBackgroundColor: true }),
    );
  });

  it('typescript error when not SVG with SVGoptions', () => {
    const pad = new SignaturePad(canvas, { backgroundColor: '#fcc' });
    pad.fromData(face);

    assert.match(
      // @ts-expect-error No ToSVGOptions unless it is an SVG
      pad.toDataURL('image/png', { includeBackgroundColor: true }),
      /^data:image\/png/,
    );
  });
});

describe('#toSVG', () => {
  it('returns SVG image', (t) => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    t.assert.snapshot(pad.toSVG());
  });

  it('returns SVG image with high DPI', (t) => {
    changeDevicePixelratio(2);
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    t.assert.snapshot(pad.toSVG());
  });

  it('returns SVG line for point groups with two points', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData([{ ...twoPointLine[0], dotSize: 4 }]);

    const svg = new DOMParser().parseFromString(pad.toSVG(), 'image/svg+xml');
    const line = svg.querySelector('line');

    assert.strictEqual(line?.getAttribute('x1'), '20');
    assert.strictEqual(line?.getAttribute('y1'), '30');
    assert.strictEqual(line?.getAttribute('x2'), '80');
    assert.strictEqual(line?.getAttribute('y2'), '90');
    assert.strictEqual(line?.getAttribute('stroke'), 'black');
    assert.strictEqual(line?.getAttribute('stroke-width'), '8');
    assert.strictEqual(line?.getAttribute('stroke-linecap'), 'round');
  });

  it('returns SVG image with backgroundColor', (t) => {
    const pad = new SignaturePad(canvas, { backgroundColor: '#fcc' });
    pad.fromData(face);

    t.assert.snapshot(pad.toSVG({ includeBackgroundColor: true }));
  });
});

describe('user interactions', () => {
  it('allows user to paint on the pad', (t) => {
    const pad = new SignaturePad(canvas);
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 240,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 240,
        clientY: 30,
        pressure: 1,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 150,
        clientY: 120,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 150,
        clientY: 120,
        pressure: 1,
      }),
    );
    t.assert.snapshot(pad.toDataURL('image/svg+xml'));
  });

  it('different pointer id events are ignored', () => {
    const pad = new SignaturePad(canvas);
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 1,
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 2,
        pointerId: 2,
        clientX: 240,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 2,
        pointerId: 2,
        clientX: 240,
        clientY: 40,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 2,
        pointerId: 2,
        clientX: 240,
        clientY: 50,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 2,
        pointerId: 2,
        clientX: 240,
        clientY: 50,
        pressure: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 1,
        pointerId: 1,
        clientX: 50,
        clientY: 40,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 1,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 1,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
        pressure: 1,
      }),
    );
    assert.deepStrictEqual(
      pad.toData()[0].points.map(({ x, y, pressure }) => ({ x, y, pressure })),
      [
        { x: 50, y: 30, pressure: 1 },
        { x: 50, y: 40, pressure: 1 },
        { x: 50, y: 50, pressure: 1 },
      ],
    );
  });

  it('different pointer id events are respected if sequential', () => {
    const pad = new SignaturePad(canvas);
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 1,
        pointerId: 1,
        isPrimary: true,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 1,
        pointerId: 1,
        isPrimary: true,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 0,
      }),
    );

    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 2,
        pointerId: 2,
        isPrimary: true,
        clientX: 240,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );

    window.dispatchEvent(
      new PointerEvent('pointermove', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 2,
        pointerId: 2,
        isPrimary: true,
        clientX: 240,
        clientY: 40,
        pressure: 1,
        buttons: 1,
      }),
    );

    window.dispatchEvent(
      new PointerEvent('pointerup', {
        // @ts-expect-error remove pointerId once persistentDeviceId is available
        persistentDeviceId: 2,
        pointerId: 2,
        isPrimary: true,
        clientX: 240,
        clientY: 50,
        pressure: 1,
      }),
    );
    assert.deepStrictEqual(
      pad.toData()[0].points.map(({ x, y, pressure }) => ({ x, y, pressure })),
      [{ x: 50, y: 30, pressure: 1 }],
    );
    assert.deepStrictEqual(
      pad.toData()[1].points.map(({ x, y, pressure }) => ({ x, y, pressure })),
      [
        { x: 240, y: 30, pressure: 1 },
        { x: 240, y: 40, pressure: 1 },
        { x: 240, y: 50, pressure: 1 },
      ],
    );
  });

  it('call endStroke on pointerup outside canvas', () => {
    const pad = new SignaturePad(canvas);
    const endStroke = mock.fn();
    pad.addEventListener('endStroke', endStroke);
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: 240,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 150,
        clientY: 120,
        pressure: 1,
      }),
    );
    assert.strictEqual(endStroke.mock.calls.length > 0, true);
  });

  it('call endStroke on pointerup outside canvas when in an external window', () => {
    const externalCanvas = document.createElement('canvas');
    externalCanvas.setAttribute('width', '300');
    externalCanvas.setAttribute('height', '150');

    const externalDocument =
      document.implementation.createHTMLDocument('New Document');

    externalDocument.body.appendChild(externalCanvas);

    const pad = new SignaturePad(externalCanvas);
    const endStroke = mock.fn();
    pad.addEventListener('endStroke', endStroke);

    externalCanvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    externalCanvas.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: 240,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    // check that original document is not affected
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 150,
        clientY: 120,
        pressure: 1,
      }),
    );
    assert.strictEqual(endStroke.mock.calls.length, 0);
    // check that external document emits
    externalDocument.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 150,
        clientY: 120,
        pressure: 1,
      }),
    );
    assert.strictEqual(endStroke.mock.calls.length > 0, true);
  });

  it('calls endStroke on pointercancel', () => {
    const pad = new SignaturePad(canvas);
    const endStroke = mock.fn();
    pad.addEventListener('endStroke', endStroke);

    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );

    window.dispatchEvent(
      new PointerEvent('pointercancel', {
        pointerId: 1,
        clientX: 60,
        clientY: 40,
        pressure: 0,
        buttons: 0,
      }),
    );

    assert.strictEqual(endStroke.mock.calls.length > 0, true);
    assert.strictEqual(pad['_drawingStroke'], false);
    assert.strictEqual(pad['_strokePointerId'], undefined);
  });

  it('allows a new stroke after pointercancel', () => {
    const pad = new SignaturePad(canvas);
    const beginStroke = mock.fn();
    const endStroke = mock.fn();
    pad.addEventListener('beginStroke', beginStroke);
    pad.addEventListener('endStroke', endStroke);

    // erster Stroke
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: 60,
        clientY: 40,
        pressure: 1,
        buttons: 1,
      }),
    );

    window.dispatchEvent(
      new PointerEvent('pointercancel', {
        pointerId: 1,
        clientX: 60,
        clientY: 40,
        pressure: 0,
        buttons: 0,
      }),
    );

    assert.strictEqual(endStroke.mock.calls.length, 1);

    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 2,
        clientX: 150,
        clientY: 80,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 2,
        clientX: 150,
        clientY: 80,
        pressure: 0,
        buttons: 0,
      }),
    );

    assert.strictEqual(beginStroke.mock.calls.length, 2);
    assert.strictEqual(endStroke.mock.calls.length, 2);
  });
});

describe(`touch events.`, () => {
  let signpad: SignaturePad;

  function createTouchEvents(cancelable: boolean) {
    const touchStartEvent = new TouchEvent('touchstart', {
      cancelable,
      targetTouches: [{} as Touch],
      changedTouches: [{ clientX: 50, clientY: 30, force: 1 } as Touch],
    });
    const touchMoveEvent = new TouchEvent('touchmove', {
      cancelable,
      targetTouches: [{} as Touch],
      changedTouches: [{ clientX: 55, clientY: 35, force: 1 } as Touch],
    });
    const touchEndEvent = new TouchEvent('touchend', {
      cancelable,
      changedTouches: [{ clientX: 55, clientY: 35, force: 1 } as Touch],
    });
    const touchStartSpy = mock.method(touchStartEvent, 'preventDefault');
    const touchMoveSpy = mock.method(touchMoveEvent, 'preventDefault');
    const touchEndSpy = mock.method(touchEndEvent, 'preventDefault');

    return { touchStartEvent, touchMoveEvent, touchEndEvent, touchStartSpy, touchMoveSpy, touchEndSpy };
  }

  beforeEach(() => {
    signpad = new SignaturePad(canvas);
    signpad.off();
    signpad['_handleTouchEvents']();
  });

  it('the event should not be prevented.', () => {
    const { touchStartEvent, touchMoveEvent, touchEndEvent, touchStartSpy, touchMoveSpy, touchEndSpy } =
      createTouchEvents(false);
    canvas.dispatchEvent(touchStartEvent);
    window.dispatchEvent(touchMoveEvent);
    window.dispatchEvent(touchEndEvent);

    assert.strictEqual(touchStartSpy.mock.calls.length, 0);
    assert.strictEqual(touchMoveSpy.mock.calls.length, 0);
    assert.strictEqual(touchEndSpy.mock.calls.length, 0);
  });

  it('the event should be prevented.', () => {
    const { touchStartEvent, touchMoveEvent, touchEndEvent, touchStartSpy, touchMoveSpy, touchEndSpy } =
      createTouchEvents(true);
    canvas.dispatchEvent(touchStartEvent);
    window.dispatchEvent(touchMoveEvent);
    window.dispatchEvent(touchEndEvent);

    assert.strictEqual(touchStartSpy.mock.calls.length, 1);
    assert.strictEqual(touchMoveSpy.mock.calls.length, 1);
    assert.strictEqual(touchEndSpy.mock.calls.length, 1);
  });

  it('calls endStroke on touchcancel', () => {
    const endStroke = mock.fn();
    signpad.addEventListener('endStroke', endStroke);

    const touchStartEvent = new TouchEvent('touchstart', {
      cancelable: true,
      targetTouches: [{} as Touch],
      changedTouches: [{ clientX: 50, clientY: 30, force: 1 } as Touch],
    });

    const touchCancelEvent = new TouchEvent('touchcancel', {
      cancelable: true,
      changedTouches: [{ clientX: 60, clientY: 40, force: 0 } as Touch],
    });
    const touchCancelSpy = mock.method(touchCancelEvent, 'preventDefault');

    canvas.dispatchEvent(touchStartEvent);
    window.dispatchEvent(touchCancelEvent);

    assert.strictEqual(endStroke.mock.calls.length > 0, true);
    assert.strictEqual(touchCancelSpy.mock.calls.length, 1);
    assert.strictEqual(signpad['_drawingStroke'], false);
  });

  it('allows a new stroke after touchcancel', () => {
    const beginStroke = mock.fn();
    const endStroke = mock.fn();
    signpad.addEventListener('beginStroke', beginStroke);
    signpad.addEventListener('endStroke', endStroke);

    const firstStart = new TouchEvent('touchstart', {
      cancelable: true,
      targetTouches: [{} as Touch],
      changedTouches: [{ clientX: 50, clientY: 30, force: 1 } as Touch],
    });
    const firstCancel = new TouchEvent('touchcancel', {
      cancelable: true,
      changedTouches: [{ clientX: 55, clientY: 35, force: 0 } as Touch],
    });

    canvas.dispatchEvent(firstStart);
    window.dispatchEvent(firstCancel);

    assert.strictEqual(endStroke.mock.calls.length, 1);

    const secondStart = new TouchEvent('touchstart', {
      cancelable: true,
      targetTouches: [{} as Touch],
      changedTouches: [{ clientX: 100, clientY: 60, force: 1 } as Touch],
    });
    const secondEnd = new TouchEvent('touchend', {
      cancelable: true,
      changedTouches: [{ clientX: 100, clientY: 60, force: 0 } as Touch],
    });

    canvas.dispatchEvent(secondStart);
    window.dispatchEvent(secondEnd);

    assert.strictEqual(beginStroke.mock.calls.length, 2);
    assert.strictEqual(endStroke.mock.calls.length, 2);
  });
});

describe('Signature events.', () => {
  let signpad: SignaturePad;
  let eventDispatched: Event | undefined;

  const eventHandler: EventListener = (evt: Event): void => {
    eventDispatched = evt;
  };

  beforeEach(() => {
    signpad = new SignaturePad(canvas);

    // to make this test works, canvas must be added to the document body.
    document.body.insertAdjacentElement('afterbegin', canvas);

    eventDispatched = undefined;
  });

  afterEach(() => {
    document.body.removeChild(canvas);
  });

  [
    { eventName: 'beginStroke', dispatchedEventName: ['pointerdown'] },
    { eventName: 'beforeUpdateStroke', dispatchedEventName: ['pointerdown'] },
    { eventName: 'afterUpdateStroke', dispatchedEventName: ['pointerdown'] },
    {
      eventName: 'endStroke',
      dispatchedEventName: ['pointerdown', 'pointerup'],
    },
  ].forEach((param) => {
    describe(`${param.eventName}.`, () => {
      function createPointerEvent(dispatchedEventName: string) {
        return new PointerEvent(dispatchedEventName, {
          pointerId: 1,
          clientX: 50,
          clientY: 30,
          pressure: 1,
          buttons: dispatchedEventName == 'pointerup' ? 0 : 1,
          bubbles: true,
        });
      }

      beforeEach(() => {
        eventDispatched = undefined;
        signpad.addEventListener(param.eventName, eventHandler);
      });

      afterEach(() => {
        signpad.removeEventListener(param.eventName, eventHandler);
      });

      it('no writing to the canvas.', () => {
        assert.strictEqual(eventDispatched, undefined);
      });

      it('writes to the canvas.', () => {
        let pointerEvent;
        for (const dispatchedEventName of param.dispatchedEventName) {
          pointerEvent = createPointerEvent(dispatchedEventName);
          canvas.dispatchEvent(pointerEvent);
        }

        assert.ok(eventDispatched);
        assert.ok(eventDispatched instanceof CustomEvent);

        const event = eventDispatched as CustomEvent;
        assert.strictEqual(event.detail.event, pointerEvent);
      });
    });
  });

  describe(`use document as EventTarget.`, () => {
    beforeEach(() => {
      signpad['_et'] = document;

      signpad.addEventListener('beginStroke', eventHandler);
    });

    afterEach(() => {
      signpad.removeEventListener('beginStroke', eventHandler);
    });

    it('the event should be dispatched.', () => {
      const eventInitObj = {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      } as PointerEventInit;
      const pointerEvent = new PointerEvent('pointerdown', eventInitObj);
      canvas.dispatchEvent(pointerEvent);

      assert.ok(eventDispatched);
      assert.ok(eventDispatched instanceof CustomEvent);

      const event = eventDispatched as CustomEvent;
      assert.strictEqual(event.detail.event, pointerEvent);
    });
  });

  it(`cancel beginStroke.`, () => {
    const endStroke = mock.fn();
    const cancelEvent = mock.fn((evt: Event): void => {
      evt.preventDefault();
    });

    signpad.addEventListener('beginStroke', cancelEvent);
    signpad.addEventListener('endStroke', endStroke);

    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: 50,
        clientY: 40,
        pressure: 1,
        buttons: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 50,
        clientY: 40,
        pressure: 1,
      }),
    );

    assert.strictEqual(cancelEvent.mock.calls.length, 1);
    assert.strictEqual(endStroke.mock.calls.length, 0);
    assert.strictEqual(signpad.isEmpty(), true);

    signpad.removeEventListener('beginStroke', cancelEvent);
    signpad.removeEventListener('endStroke', endStroke);
  });
});
