// Slightly simplified version of http://stackoverflow.com/a/27078401/815507

export function throttle(fn: (...args: any[]) => any, wait = 250) {
  let previous = 0;
  let timeout: number | null = null;
  let result: any;
  let storedContext: any;
  let storedArgs: any[];

  const later = () => {
    previous = Date.now();
    timeout = null;
    result = fn.apply(storedContext, storedArgs);

    if (!timeout) {
      storedContext = null;
      storedArgs = [];
    }
  };

  return function (this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    storedContext = this;
    storedArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      result = fn.apply(storedContext, storedArgs);

      if (!timeout) {
        storedContext = null;
        storedArgs = [];
      }
    } else if (!timeout) {
      timeout = window.setTimeout(later, remaining);
    }

    return result;
  };
}
