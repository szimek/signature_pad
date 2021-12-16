import SignaturePad from '../src/signature_pad';
import { face } from './fixtures/face';
import { square } from './fixtures/square';
import './utils/pointer-event-polyfill';

let canvas: HTMLCanvasElement;

beforeAll(() => {
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
  // Unfortunately, results of Canvas#toDataURL depend on a platform :/
  // it('returns PNG image in data URL format', () => {
  //   const pad = new SignaturePad(canvas);
  //   pad.fromData(face);
  //
  //   expect(pad.toDataURL('image/png')).toMatchSnapshot();
  // });

  // Synchronous Canvas#toDataURL for JPEG images is not supported by 'canvas' library :/
  // it.skip('returns JPG image in data URL format', () => {});

  it('returns SVG image in data URL format', () => {
    const pad = new SignaturePad(canvas);
    pad.fromData(face);

    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
  });
});

describe('user interactions', () => {
  it('allows user to paint on the pad', () => {
    const pad = new SignaturePad(canvas);
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 50,
        clientY: 30,
        pressure: 1,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 240,
        clientY: 30,
        pressure: 1,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 120,
        pressure: 1,
      }),
    );
    expect(pad.toDataURL('image/svg+xml')).toMatchSnapshot();
  });
});

describe('Signature events.', () => {
  let signpad: SignaturePad;
  let eventDispatched: Event;

  const eventHandler: EventListener = (evt: Event): void => {
    eventDispatched = evt;
  };

  beforeEach(() => {
    signpad = new SignaturePad(canvas);

    // to make this test works, canvas must be added to the document body.
    document.body.insertAdjacentElement('afterbegin', canvas);
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    eventDispatched = undefined!;

    document.body.removeChild(canvas);
  });

  [
    { eventName: 'beginStroke', dispatchedEventName: 'pointerdown' },
    { eventName: 'beforeUpdateStroke', dispatchedEventName: 'pointerdown' },
    { eventName: 'afterUpdateStroke', dispatchedEventName: 'pointerdown' },
    { eventName: 'endStroke', dispatchedEventName: 'pointerup' },
  ].forEach((param) => {
    describe(`${param.eventName}.`, () => {
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
        const eventInitObj = <PointerEventInit>{
          clientX: 50,
          clientY: 30,
          pressure: 1,
          bubbles: true,
        };
        const pointerEvent = new PointerEvent(
          param.dispatchedEventName,
          eventInitObj,
        );
        canvas.dispatchEvent(pointerEvent);

        expect(eventDispatched).toBeTruthy();
        expect(eventDispatched).toBeInstanceOf(CustomEvent);

        const event = <CustomEvent>eventDispatched;
        expect(event.detail).toBe(pointerEvent);
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
        clientX: 50,
        clientY: 30,
        pressure: 1,
      };
      const pointerEvent = new PointerEvent('pointerdown', eventInitObj);
      canvas.dispatchEvent(pointerEvent);

      expect(eventDispatched).toBeTruthy();
      expect(eventDispatched).toBeInstanceOf(CustomEvent);

      const event = <CustomEvent>eventDispatched;
      expect(event.detail).toBe(pointerEvent);
    });
  });
});
