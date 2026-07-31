import { register } from 'node:module';
import { JSDOM } from 'jsdom';

register('./loader-hooks.js', import.meta.url);

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:3000/',
  resources: 'usable',
});

// @ts-expect-error Assigning JSDOM window to global
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true,
});
global.HTMLElement = dom.window.HTMLElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.MouseEvent = dom.window.MouseEvent;
global.Touch = dom.window.Touch;
global.TouchEvent = dom.window.TouchEvent;
global.Event = dom.window.Event;
global.CustomEvent = dom.window.CustomEvent;
global.Image = dom.window.Image;
global.DOMParser = dom.window.DOMParser;

// Apply PointerEvent polyfill
if (!dom.window.PointerEvent) {
  class PointerEvent extends dom.window.MouseEvent {
    public height?: number;
    public isPrimary?: boolean;
    public pointerId?: number;
    public pointerType?: string;
    public pressure?: number;
    public tangentialPressure?: number;
    public tiltX?: number;
    public tiltY?: number;
    public twist?: number;
    public width?: number;
    public buttons?: number;
    public button?: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      Object.defineProperty(this, 'pointerId', { value: params.pointerId ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'width', { value: params.width ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'height', { value: params.height ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'pressure', { value: params.pressure ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'tangentialPressure', { value: params.tangentialPressure ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'tiltX', { value: params.tiltX ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'tiltY', { value: params.tiltY ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'pointerType', { value: params.pointerType ?? 'mouse', writable: true, configurable: true });
      Object.defineProperty(this, 'isPrimary', { value: params.isPrimary ?? false, writable: true, configurable: true });
      Object.defineProperty(this, 'buttons', { value: params.buttons ?? 0, writable: true, configurable: true });
      Object.defineProperty(this, 'button', { value: params.button ?? 0, writable: true, configurable: true });
    }
  }
  // @ts-expect-error Assigning PointerEvent to window and global
  dom.window.PointerEvent = PointerEvent;
  // @ts-expect-error Assigning PointerEvent to global
  global.PointerEvent = PointerEvent;
  // @ts-expect-error Assigning PointerEvent to globalThis
  globalThis.PointerEvent = PointerEvent;
}

const mockContext2D = () => {
  const ctx = {
    canvas: null,
    fillStyle: '#000000',
    globalCompositeOperation: 'source-over',
    scale: () => {},
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    bezierCurveTo: () => {},
    quadraticCurveTo: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    save: () => {},
    restore: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {},
    createPattern: () => ({}),
  };
  return ctx;
};

// @ts-expect-error Mocking getContext
dom.window.HTMLCanvasElement.prototype.getContext = function (type: string) {
  if (type === '2d') {
    if (!this._mockCtx) {
      this._mockCtx = mockContext2D();
      this._mockCtx.canvas = this;
    }
    return this._mockCtx;
  }
  return null;
};

dom.window.HTMLCanvasElement.prototype.toDataURL = function (type?: string) {
  if (type === 'image/svg+xml') {
    return 'data:image/svg+xml;base64,';
  }
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
};
