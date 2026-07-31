/* eslint-disable @typescript-eslint/no-explicit-any */
if (!global.PointerEvent || (global.window && !global.window.PointerEvent)) {
  const ParentClass = (global.window && global.window.MouseEvent) ? global.window.MouseEvent : MouseEvent;
  class PointerEvent extends ParentClass {
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
  global.PointerEvent = PointerEvent as any;
  if (global.window) {
    (global.window as any).PointerEvent = PointerEvent as any;
  }
}
