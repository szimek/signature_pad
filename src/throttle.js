/* eslint-disable no-multi-assign, prefer-rest-params */
function Throttler(func, wait, options) {
  const self = this;
  this._func = func;
  this._wait = wait;
  this._options = options;
  if (!options) this._options = {};
  this._later = function () {
    self._previous = self._options.leading === false ? 0 : Date.now();
    self._timeout = null;
    const result = self._func.apply(self._context, self._args);
    if (!self._timeout) self._context = self._args = null;
    return result;
  };

  this.throttledFunction = function () {
    const now = Date.now();
    let result;
    if (!self._previous && self._options.leading === false) self._previous = now;
    const remaining = self._wait - (now - self._previous);
    self._context = this;
    self._args = arguments;
    if (remaining <= 0 || remaining > self._wait) {
      if (self._timeout) {
        clearTimeout(self._timeout);
        self._timeout = null;
      }
      self._previous = now;
      result = self._func.apply(self._context, self._args);
      if (!self._timeout) self._context = self._args = null;
    } else if (!self._timeout && self._options.trailing !== false) {
      self._timeout = setTimeout(self._later, remaining);
    }
    return result;
  };
}

Throttler.prototype.flush = function () {
  let result;
  if (this._timeout) {
    clearTimeout(this._timeout);
    this._timeout = null;
    result = this._func.apply(this._context, this._args);
    if (!this._timeout) this._context = this._args = null;
  }

  return result;
};
/* eslint-enable no-multi-spaces, space-in-parens */

export default Throttler;
