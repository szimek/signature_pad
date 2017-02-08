import Point from './point';
import Bezier from './bezier';

function SignaturePad(canvas, options) {
  const self = this;
  const opts = options || {};

  this.velocityFilterWeight = opts.velocityFilterWeight || 0.7;
  this.minWidth = opts.minWidth || 0.5;
  this.maxWidth = opts.maxWidth || 2.5;
  this.dotSize = opts.dotSize || function () {
    return (this.minWidth + this.maxWidth) / 2;
  };
  this.penColor = opts.penColor || 'black';
  this.backgroundColor = opts.backgroundColor || 'rgba(0,0,0,0)';
  this.crop = opts.crop || false;
  this.onBegin = opts.onBegin;
  this.onEnd = opts.onEnd;

  this._canvas = canvas;
  this._ctx = canvas.getContext('2d');
  this.clear();

  // We need add these inline so they are available to unbind while still having
  // access to 'self' we could use _.bind but it's not worth adding a dependency.
  this._handleMouseDown = function (event) {
    if (event.which === 1) {
      self._mouseButtonDown = true;
      self._strokeBegin(event);
    }
  };

  this._handleMouseMove = function (event) {
    if (self._mouseButtonDown) {
      self._strokeUpdate(event);
    }
  };

  this._handleMouseUp = function (event) {
    if (event.which === 1 && self._mouseButtonDown) {
      self._mouseButtonDown = false;
      self._strokeEnd(event);
    }
  };

  this._handleTouchStart = function (event) {
    if (event.targetTouches.length === 1) {
      const touch = event.changedTouches[0];
      self._strokeBegin(touch);
    }
  };

  this._handleTouchMove = function (event) {
    // Prevent scrolling.
    event.preventDefault();

    const touch = event.targetTouches[0];
    self._strokeUpdate(touch);
  };

  this._handleTouchEnd = function (event) {
    const wasCanvasTouched = event.target === self._canvas;
    if (wasCanvasTouched) {
      event.preventDefault();
      self._strokeEnd(event);
    }
  };

  // Enable mouse and touch event handlers
  this.on();
}

// Public methods
SignaturePad.prototype.clear = function () {
  const ctx = this._ctx;
  const canvas = this._canvas;

  ctx.fillStyle = this.backgroundColor;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  this._data = [];
  this._reset();
  this._isEmpty = true;
};

SignaturePad.prototype.fromDataURL = function (dataUrl) {
  const image = new Image();
  const ratio = window.devicePixelRatio || 1;
  const width = this._canvas.width / ratio;
  const height = this._canvas.height / ratio;

  this._reset();
  image.src = dataUrl;
  image.onload = () => {
    this._ctx.drawImage(image, 0, 0, width, height);
  };
  this._isEmpty = false;
};

SignaturePad.prototype.toDataURL = function (type, ...options) {
  switch (type) {
    case 'image/svg+xml':
      return this._toSVG();
    default: {
      let canvas = this._canvas;
      if (this.crop) {
        const imageData = this._getImageDataCropped();
        canvas = this._createCanvasFromImageData(imageData);
      }
      return canvas.toDataURL(type, ...options);
    }
  }
};

SignaturePad.prototype.on = function () {
  this._handleMouseEvents();
  this._handleTouchEvents();
};

SignaturePad.prototype.off = function () {
  this._canvas.removeEventListener('mousedown', this._handleMouseDown);
  this._canvas.removeEventListener('mousemove', this._handleMouseMove);
  document.removeEventListener('mouseup', this._handleMouseUp);

  this._canvas.removeEventListener('touchstart', this._handleTouchStart);
  this._canvas.removeEventListener('touchmove', this._handleTouchMove);
  this._canvas.removeEventListener('touchend', this._handleTouchEnd);
};

SignaturePad.prototype.isEmpty = function () {
  return this._isEmpty;
};

SignaturePad.prototype.drawImage = function (image) {
  const width = this._canvas.width;
  const height = this._canvas.height;
  const hRatio = width / image.width;
  const vRatio = height / image.height;
  const ratio = Math.min(hRatio, vRatio, 1);
  const centerShiftX = (width - (image.width * ratio)) / 2;
  const centerShiftY = (height - (image.height * ratio)) / 2;
  const destWidth = image.width * ratio;
  const destHeight = image.height * ratio;
  this._ctx.clearRect(0, 0, width, height);
  this._ctx.drawImage(image, centerShiftX, centerShiftY, destWidth, destHeight);
};

SignaturePad.prototype.resize = function (width, height, scaleDown) {
  // Dont do anything if width and height have not changed
  if (this._canvas.width === width && this._canvas.height === height) {
    return;
  }

  // If signature is empty, just resize.
  if (this.isEmpty()) {
    this._canvas.width = width;
    this._canvas.height = height;
    return;
  }

  // Get the cropped image inside the canvas so that we can check if we need
  // to resize the image before we resize the canvas
  const croppedImageData = this._getImageDataCropped();

  // If the cropped image will fit inside the new canvas size,
  // we can just center it inside the new canvas
  if (width >= croppedImageData.width && height >= croppedImageData.height) {
    const centerShiftX = (width - croppedImageData.width) / 2;
    const centerShiftY = (height - croppedImageData.height) / 2;
    this._canvas.width = width;
    this._canvas.height = height;
    this._ctx.putImageData(
      croppedImageData,
      centerShiftX,
      centerShiftY,
      0,
      0,
      croppedImageData.width,
      croppedImageData.height,
    );
    return;
  }

  // If the cropped image will not fit inside the new canvas size
  // we can either scale the image down to fit or just clear the canvas
  if (!scaleDown) {
    this._canvas.width = width;
    this._canvas.height = height;
    this.clear();
    return;
  }

  const croppedCanvas = this._createCanvasFromImageData(croppedImageData);
  this._canvas.width = width;
  this._canvas.height = height;
  this.drawImage(croppedCanvas);
};

// Private methods
SignaturePad.prototype._getImageDataCropped = function () {
  const imgWidth = this._ctx.canvas.width;
  const imgHeight = this._ctx.canvas.height;
  const imageData = this._ctx.getImageData(0, 0, imgWidth, imgHeight);
  if (this.isEmpty()) {
    return imageData;
  }

  const data = imageData.data;
  const getAlpha = function (x, y) {
    return data[(((imgWidth * y) + x) * 4) + 3];
  };
  const scanY = function (fromTop) {
    const offset = fromTop ? 1 : -1;

    // loop through each row
    for (let y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
            // loop through each column
      for (let x = 0; x < imgWidth; x += 1) {
        if (getAlpha(x, y)) {
          return y;
        }
      }
    }
    return null; // all image is white
  };
  const scanX = function (fromLeft) {
    const offset = fromLeft ? 1 : -1;

    // loop through each column
    for (let x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
      // loop through each row
      for (let y = 0; y < imgHeight; y += 1) {
        if (getAlpha(x, y)) {
          return x;
        }
      }
    }
    return null; // all image is white
  };
  const cropTop = scanY(true);
  const cropBottom = scanY(false);
  const cropLeft = scanX(true);
  const cropRight = scanX(false);
  // If the signature has a 1 pixel width, cropRight and cropLeft would be the same value
  // hence the need to add an extra pixel to the width and height values
  const width = (cropRight - cropLeft) + 1;
  const height = (cropBottom - cropTop) + 1;
  return this._ctx.getImageData(cropLeft, cropTop, width, height);
};

SignaturePad.prototype._createCroppedCanvas = function () {
  const croppedImageData = this._getImageDataCropped();
  return this._createCanvasFromImageData(croppedImageData);
};

SignaturePad.prototype._createCanvasFromImageData = function (imageData) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context.clearRect(0, 0, imageData.width, imageData.height);
  context.putImageData(imageData, 0, 0);

  return canvas;
};

SignaturePad.prototype._strokeBegin = function (event) {
  this._data.push([]);
  this._reset();
  this._strokeUpdate(event);

  if (typeof this.onBegin === 'function') {
    this.onBegin(event);
  }
};

SignaturePad.prototype._strokeUpdate = function (event) {
  const x = event.clientX;
  const y = event.clientY;

  const point = this._createPoint(x, y);
  const { curve, widths } = this._addPoint(point);

  if (curve && widths) {
    this._drawCurve(curve, widths.start, widths.end);
  }

  this._data[this._data.length - 1].push({
    x: point.x,
    y: point.y,
    time: point.time,
  });
};

SignaturePad.prototype._strokeEnd = function (event) {
  const canDrawCurve = this.points.length > 2;
  const point = this.points[0];

  if (!canDrawCurve && point) {
    this._drawDot(point);
  }

  if (typeof this.onEnd === 'function') {
    this.onEnd(event);
  }
};

SignaturePad.prototype._handleMouseEvents = function () {
  this._mouseButtonDown = false;

  this._canvas.addEventListener('mousedown', this._handleMouseDown);
  this._canvas.addEventListener('mousemove', this._handleMouseMove);
  document.addEventListener('mouseup', this._handleMouseUp);
};

SignaturePad.prototype._handleTouchEvents = function () {
  // Pass touch events to canvas element on mobile IE11 and Edge.
  this._canvas.style.msTouchAction = 'none';
  this._canvas.style.touchAction = 'none';

  this._canvas.addEventListener('touchstart', this._handleTouchStart);
  this._canvas.addEventListener('touchmove', this._handleTouchMove);
  this._canvas.addEventListener('touchend', this._handleTouchEnd);
};

SignaturePad.prototype._reset = function () {
  this.points = [];
  this._lastVelocity = 0;
  this._lastWidth = (this.minWidth + this.maxWidth) / 2;
  this._ctx.fillStyle = this.penColor;
};

SignaturePad.prototype._createPoint = function (x, y, time) {
  const rect = this._canvas.getBoundingClientRect();

  return new Point(
    x - rect.left,
    y - rect.top,
    time || new Date().getTime(),
  );
};

SignaturePad.prototype._addPoint = function (point) {
  const points = this.points;
  let tmp;

  points.push(point);

  if (points.length > 2) {
    // To reduce the initial lag make it work with 3 points
    // by copying the first point to the beginning.
    if (points.length === 3) points.unshift(points[0]);

    tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
    const c2 = tmp.c2;
    tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
    const c3 = tmp.c1;
    const curve = new Bezier(points[1], c2, c3, points[2]);
    const widths = this._calculateCurveWidths(curve);

    // Remove the first element from the list,
    // so that we always have no more than 4 points in points array.
    points.shift();

    return { curve, widths };
  }

  return {};
};

SignaturePad.prototype._calculateCurveControlPoints = function (s1, s2, s3) {
  const dx1 = s1.x - s2.x;
  const dy1 = s1.y - s2.y;
  const dx2 = s2.x - s3.x;
  const dy2 = s2.y - s3.y;

  const m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
  const m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

  const l1 = Math.sqrt((dx1 * dx1) + (dy1 * dy1));
  const l2 = Math.sqrt((dx2 * dx2) + (dy2 * dy2));

  const dxm = (m1.x - m2.x);
  const dym = (m1.y - m2.y);

  const k = l2 / (l1 + l2);
  const cm = { x: m2.x + (dxm * k), y: m2.y + (dym * k) };

  const tx = s2.x - cm.x;
  const ty = s2.y - cm.y;

  return {
    c1: new Point(m1.x + tx, m1.y + ty),
    c2: new Point(m2.x + tx, m2.y + ty),
  };
};

SignaturePad.prototype._calculateCurveWidths = function (curve) {
  const startPoint = curve.startPoint;
  const endPoint = curve.endPoint;
  const widths = { start: null, end: null };

  const velocity = (this.velocityFilterWeight * endPoint.velocityFrom(startPoint))
   + ((1 - this.velocityFilterWeight) * this._lastVelocity);

  const newWidth = this._strokeWidth(velocity);

  widths.start = this._lastWidth;
  widths.end = newWidth;

  this._lastVelocity = velocity;
  this._lastWidth = newWidth;

  return widths;
};

SignaturePad.prototype._strokeWidth = function (velocity) {
  return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
};

SignaturePad.prototype._drawPoint = function (x, y, size) {
  const ctx = this._ctx;

  ctx.moveTo(x, y);
  ctx.arc(x, y, size, 0, 2 * Math.PI, false);
  this._isEmpty = false;
};

SignaturePad.prototype._drawCurve = function (curve, startWidth, endWidth) {
  const ctx = this._ctx;
  const widthDelta = endWidth - startWidth;
  const drawSteps = Math.floor(curve.length());

  ctx.beginPath();

  for (let i = 0; i < drawSteps; i += 1) {
    // Calculate the Bezier (x, y) coordinate for this step.
    const t = i / drawSteps;
    const tt = t * t;
    const ttt = tt * t;
    const u = 1 - t;
    const uu = u * u;
    const uuu = uu * u;

    let x = uuu * curve.startPoint.x;
    x += 3 * uu * t * curve.control1.x;
    x += 3 * u * tt * curve.control2.x;
    x += ttt * curve.endPoint.x;

    let y = uuu * curve.startPoint.y;
    y += 3 * uu * t * curve.control1.y;
    y += 3 * u * tt * curve.control2.y;
    y += ttt * curve.endPoint.y;

    const width = startWidth + (ttt * widthDelta);
    this._drawPoint(x, y, width);
  }

  ctx.closePath();
  ctx.fill();
};

SignaturePad.prototype._drawDot = function (point) {
  const ctx = this._ctx;
  const width = (typeof this.dotSize) === 'function' ? this.dotSize() : this.dotSize;

  ctx.beginPath();
  this._drawPoint(point.x, point.y, width);
  ctx.closePath();
  ctx.fill();
};

SignaturePad.prototype._fromData = function (pointGroups, drawCurve, drawDot) {
  for (let i = 0; i < pointGroups.length; i += 1) {
    const group = pointGroups[i];

    if (group.length > 1) {
      for (let j = 0; j < group.length; j += 1) {
        const rawPoint = group[j];
        const point = new Point(rawPoint.x, rawPoint.y, rawPoint.time);

        if (j === 0) {
          // First point in a group. Nothing to draw yet.
          this._reset();
          this._addPoint(point);
        } else if (j !== group.length - 1) {
          // Middle point in a group.
          const { curve, widths } = this._addPoint(point);
          if (curve && widths) {
            drawCurve(curve, widths);
          }
        } else {
          // Last point in a group. Do nothing.
        }
      }
    } else {
      this._reset();
      const rawPoint = group[0];
      drawDot(rawPoint);
    }
  }
};

SignaturePad.prototype._toSVG = function () {
  const pointGroups = this._data;
  const canvas = this._canvas;
  const minX = 0;
  const minY = 0;
  const maxX = canvas.width;
  const maxY = canvas.height;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttributeNS(null, 'width', canvas.width);
  svg.setAttributeNS(null, 'height', canvas.height);

  this._fromData(
    pointGroups,
    (curve, widths) => {
      const path = document.createElementNS('http;//www.w3.org/2000/svg', 'path');

      // Need to check curve for NaN values, these pop up when drawing
      // lines on the canvas that are not continuous. E.g. Sharp corners
      // or stopping mid-stroke and than continuing without lifting mouse.
      if (!isNaN(curve.control1.x) &&
          !isNaN(curve.control1.y) &&
          !isNaN(curve.control2.x) &&
          !isNaN(curve.control2.y)) {
        const attr = `M ${curve.startPoint.x.toFixed(3)},${curve.startPoint.y.toFixed(3)} `
                   + `C ${curve.control1.x.toFixed(3)},${curve.control1.y.toFixed(3)} `
                   + `${curve.control2.x.toFixed(3)},${curve.control2.y.toFixed(3)} `
                   + `${curve.endPoint.x.toFixed(3)},${curve.endPoint.y.toFixed(3)}`;

        path.setAttribute('d', attr);
        path.setAttributeNS(null, 'stroke-width', (widths.end * 2.25).toFixed(3));
        path.setAttributeNS(null, 'stroke', this.penColor);
        path.setAttributeNS(null, 'fill', 'none');
        path.setAttributeNS(null, 'stroke-linecap', 'round');

        svg.appendChild(path);
      }
    },
    (rawPoint) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const dotSize = (typeof this.dotSize) === 'function' ? this.dotSize() : this.dotSize;
      circle.setAttributeNS(null, 'r', dotSize);
      circle.setAttributeNS(null, 'cx', rawPoint.x);
      circle.setAttributeNS(null, 'cy', rawPoint.y);
      circle.setAttributeNS(null, 'fill', this.penColor);

      svg.appendChild(circle);
    },
  );

  const prefix = 'data:image/svg+xml;base64,';
  const header = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${minX} ${minY} ${maxX} ${maxY}">`;
  const body = svg.innerHTML;
  const footer = '</svg>';
  const data = header + body + footer;

  return prefix + btoa(data);
};

SignaturePad.prototype.fromData = function (pointGroups) {
  this.clear();

  this._fromData(
    pointGroups,
    (curve, widths) => this._drawCurve(curve, widths.start, widths.end),
    rawPoint => this._drawDot(rawPoint),
  );
};

SignaturePad.prototype.toData = function () {
  return this._data;
};

export default SignaturePad;
