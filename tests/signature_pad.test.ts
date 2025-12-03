import SignaturePad from '../src/signature_pad';
import type { Options } from '../src/signature_pad';
import { face } from './fixtures/face';
import { square } from './fixtures/square';
import './utils/pointer-event-polyfill';

let canvas: HTMLCanvasElement;
const dpr = window.devicePixelRatio;

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

    expect(actual).toStrictEqual(exp);
  });

  it('disables user selection and touch actions on the canvas', () => {
    new SignaturePad(canvas);

    expect(canvas.style.touchAction).toBe('none');
    expect(canvas.style.userSelect).toBe('none');
    expect(canvas.style.webkitUserSelect).toBe('none');
  });
});

describe('#off', () => {
  it('resets canvas styles for touch action and user selection', () => {
    const pad = new SignaturePad(canvas);
    pad.off();

    expect(canvas.style.touchAction).toBe('auto');
    expect(canvas.style.userSelect).toBe('auto');
    expect(canvas.style.webkitUserSelect).toBe('auto');
  });
});

describe('#redraw', () => {
  it('redraws the canvas', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    pad.redraw();
    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
  });

  it('redraws the dataurl with options', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    const dataUrl = pad.toDataURL('image/svg+xml');
    pad.clear();
    pad.fromDataURL(dataUrl, {width: 100, height: 100});
    pad.redraw();
    expect(pad.toDataURL('image/svg+xml', { includeDataUrl: true })).toMatchSnapshot();
  });
});

describe('#clear', () => {
  // it.skip('clears canvas', () => {});

  it('clears data structures', () => {
    const pad = new SignaturePad(canvas);

    pad.fromData(face);
    expect(pad.isEmpty()).toBe(false);

    pad.clear();

    expect(pad.isEmpty()).toBe(true);
    expect(pad.toData()).toEqual([]);
  });

  it('clear should apply erase option to the canvas context', () => {
    const pad = new SignaturePad(canvas);

    pad.fromData(face);
    expect(pad.isEmpty()).toBe(false);

    pad.penColor = 'pink';
    pad.compositeOperation = 'destination-out';

    pad.clear();

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    expect(context.globalCompositeOperation).toBe('destination-out');
  });
});

describe('#isEmpty', () => {
  it('returns true if pad is empty', () => {
    const pad = new SignaturePad(canvas);

    expect(pad.isEmpty()).toBe(true);
  });

  it('returns false if pad is not empty', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.isEmpty()).toBe(false);
  });
});

describe('#fromData', () => {
  it('clears the canvas', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    pad.fromData(square);

    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
  });

  it('does not clear the canvas', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);
    pad.fromData(square, { clear: false });

    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
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
    expect(pad.toDataURL('image/svg+xml')).toBe(expected);
  });
});

describe('#toData', () => {
  it('returns JSON with point groups', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.toData()).toEqual(face);
  });
});

// describe('#fromDataURL', () => {});

describe('#toDataURL', () => {
  it('returns PNG image by default', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.toDataURL()).toEqual(expect.stringMatching('data:image/png'));
  });

  it('returns PNG image in data URL format', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    // Unfortunately, results of Canvas#toDataURL depend on a platform :/
    expect(pad.toDataURL('image/png')).toEqual(
      expect.stringMatching('data:image/png'),
    );
  });

  // Synchronous Canvas#toDataURL for JPEG images is not supported by 'canvas' library :/
  // it.skip('returns JPG image in data URL format', () => {});

  it('returns SVG image in data URL format', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
  });

  it('returns SVG image in data URL format with high DPI', () => {
    changeDevicePixelratio(2);
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
  });

  it('returns SVG image with backgroundColor', () => {
    const pad = new SignaturePad(canvas, { backgroundColor: '#fcc' });
    pad.fromData(face);

    expect(
      pad.toDataURL('image/svg+xml', { includeBackgroundColor: true }),
    ).toMatchSnapshot();
  });

  it('typescript error when not SVG with SVGoptions', () => {
    const pad = new SignaturePad(canvas, { backgroundColor: '#fcc' });
    pad.fromData(face);

    expect(
      // @ts-expect-error No ToSVGOptions unless it is an SVG
      pad.toDataURL('image/png', { includeBackgroundColor: true }),
    ).toEqual(expect.stringMatching('data:image/png'));
  });
});

describe('#toSVG', () => {
  it('returns SVG image', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.toSVG()).toMatchSnapshot();
  });

  it('returns SVG image with high DPI', () => {
    changeDevicePixelratio(2);
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.toSVG()).toMatchSnapshot();
  });

  it('returns SVG image with backgroundColor', () => {
    const pad = new SignaturePad(canvas, { backgroundColor: '#fcc' });
    pad.fromData(face);

    expect(pad.toSVG({ includeBackgroundColor: true })).toMatchSnapshot();
  });
});

describe('user interactions', () => {
  it('allows user to paint on the pad', () => {
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
    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
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
    expect(pad.toData()[0].points).toMatchObject([
      { x: 50, y: 30, pressure: 1 },
      { x: 50, y: 40, pressure: 1 },
      { x: 50, y: 50, pressure: 1 },
    ]);
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
    expect(pad.toData()[0].points).toMatchObject([
      { x: 50, y: 30, pressure: 1 },
    ]);
    expect(pad.toData()[1].points).toMatchObject([
      { x: 240, y: 30, pressure: 1 },
      { x: 240, y: 40, pressure: 1 },
      { x: 240, y: 50, pressure: 1 },
    ]);
  });

  it('call endStroke on pointerup outside canvas', () => {
    const pad = new SignaturePad(canvas);
    const endStroke = jest.fn();
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
    expect(endStroke).toHaveBeenCalled();
  });

  it('call endStroke on pointerup outside canvas when in an external window', () => {
    const externalCanvas = document.createElement('canvas');
    externalCanvas.setAttribute('width', '300');
    externalCanvas.setAttribute('height', '150');

    const externalDocument =
      document.implementation.createHTMLDocument('New Document');

    externalDocument.body.appendChild(externalCanvas);

    const pad = new SignaturePad(externalCanvas);
    const endStroke = jest.fn();
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
    expect(endStroke).not.toHaveBeenCalled();
    // check that external document emits
    externalDocument.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 150,
        clientY: 120,
        pressure: 1,
      }),
    );
    expect(endStroke).toHaveBeenCalled();
  });

  it('calls endStroke on pointercancel', () => {
    const pad = new SignaturePad(canvas);
    const endStroke = jest.fn();
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

    expect(endStroke).toHaveBeenCalled();
    expect(pad['_drawingStroke']).toBe(false);
    expect(pad['_strokePointerId']).toBeUndefined();
  });

  it('allows a new stroke after pointercancel', () => {
    const pad = new SignaturePad(canvas);
    const beginStroke = jest.fn();
    const endStroke = jest.fn();
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

    expect(endStroke).toHaveBeenCalledTimes(1);

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

    expect(beginStroke).toHaveBeenCalledTimes(2);
    expect(endStroke).toHaveBeenCalledTimes(2);
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
    jest.spyOn(touchStartEvent, 'preventDefault');
    jest.spyOn(touchMoveEvent, 'preventDefault');
    jest.spyOn(touchEndEvent, 'preventDefault');

    return { touchStartEvent, touchMoveEvent, touchEndEvent };
  }

  beforeEach(() => {
    signpad = new SignaturePad(canvas);
    signpad.off();
    signpad['_handleTouchEvents']();
  });

  it('the event should not be prevented.', () => {
    const { touchStartEvent, touchMoveEvent, touchEndEvent } =
      createTouchEvents(false);
    canvas.dispatchEvent(touchStartEvent);
    window.dispatchEvent(touchMoveEvent);
    window.dispatchEvent(touchEndEvent);

    expect(touchStartEvent.preventDefault).not.toHaveBeenCalled();
    expect(touchMoveEvent.preventDefault).not.toHaveBeenCalled();
    expect(touchEndEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('the event should be prevented.', () => {
    const { touchStartEvent, touchMoveEvent, touchEndEvent } =
      createTouchEvents(true);
    canvas.dispatchEvent(touchStartEvent);
    window.dispatchEvent(touchMoveEvent);
    window.dispatchEvent(touchEndEvent);

    expect(touchStartEvent.preventDefault).toHaveBeenCalled();
    expect(touchMoveEvent.preventDefault).toHaveBeenCalled();
    expect(touchEndEvent.preventDefault).toHaveBeenCalled();
  });

  it('calls endStroke on touchcancel', () => {
    const endStroke = jest.fn();
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
    jest.spyOn(touchCancelEvent, 'preventDefault');

    canvas.dispatchEvent(touchStartEvent);
    window.dispatchEvent(touchCancelEvent);

    expect(endStroke).toHaveBeenCalled();
    expect(touchCancelEvent.preventDefault).toHaveBeenCalled();
    expect(signpad['_drawingStroke']).toBe(false);
  });

  it('allows a new stroke after touchcancel', () => {
    const beginStroke = jest.fn();
    const endStroke = jest.fn();
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

    expect(endStroke).toHaveBeenCalledTimes(1);

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

    expect(beginStroke).toHaveBeenCalledTimes(2);
    expect(endStroke).toHaveBeenCalledTimes(2);
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
        signpad.addEventListener(param.eventName, eventHandler);
      });

      afterEach(() => {
        signpad.removeEventListener(param.eventName, eventHandler);
      });

      it('no writing to the canvas.', () => {
        expect(eventDispatched).toBeFalsy();
      });

      it('writes to the canvas.', () => {
        let pointerEvent;
        for (const dispatchedEventName of param.dispatchedEventName) {
          pointerEvent = createPointerEvent(dispatchedEventName);
          canvas.dispatchEvent(pointerEvent);
        }

        expect(eventDispatched).toBeTruthy();
        expect(eventDispatched).toBeInstanceOf(CustomEvent);

        const event = <CustomEvent>eventDispatched;
        expect(event.detail.event).toBe(pointerEvent);
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
      const eventInitObj = <PointerEventInit>{
        pointerId: 1,
        clientX: 50,
        clientY: 30,
        pressure: 1,
        buttons: 1,
      };
      const pointerEvent = new PointerEvent('pointerdown', eventInitObj);
      canvas.dispatchEvent(pointerEvent);

      expect(eventDispatched).toBeTruthy();
      expect(eventDispatched).toBeInstanceOf(CustomEvent);

      const event = <CustomEvent>eventDispatched;
      expect(event.detail.event).toBe(pointerEvent);
    });
  });

  it(`cancel beginStroke.`, () => {
    const endStroke: EventListener = jest.fn();
    const cancelEvent: EventListener = jest.fn((evt: Event): void => {
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

    expect(cancelEvent).toHaveBeenCalled();
    expect(endStroke).not.toHaveBeenCalled();
    expect(signpad.isEmpty()).toBe(true);

    signpad.removeEventListener('beginStroke', cancelEvent);
    signpad.removeEventListener('endStroke', endStroke);
  });
});
