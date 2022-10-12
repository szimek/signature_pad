export class SignatureEventTarget {
  /* tslint:disable: variable-name */
  private _et: EventTarget;
  /* tslint:enable: variable-name */

  constructor() {
    try {
      this._et = new EventTarget();
    } catch (error) {
      // Using document as EventTarget to support iOS 13 and older.
      // Because EventTarget constructor just exists at iOS 14 and later.
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
