export class SignatureEventTarget implements EventTarget {
  /* tslint:disable: variable-name */
  private _et: EventTarget;
  /* tslint:enable: variable-name */

  constructor() {
    try {
      this._et = new EventTarget();
    } catch (error) {
      console.warn('EventTarget object not supported, use document instead.');
      this._et = document;
    }
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this._et.addEventListener(type, listener, options);
  }

  dispatchEvent(event: Event): boolean {
    return this._et.dispatchEvent(event);
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void {
    this._et.removeEventListener(type, callback, options);
  }
}
