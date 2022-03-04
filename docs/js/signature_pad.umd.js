/*!
 * Signature Pad v4.0.2 | https://github.com/szimek/signature_pad
 * (c) 2022 Szymon Nowak | Released under the MIT license
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SignaturePad = factory());
})(this, (function () { 'use strict';

    class Point {
        constructor(x, y, pressure, time) {
            if (isNaN(x) || isNaN(y)) {
                throw new Error(`Point is invalid: (${x}, ${y})`);
            }
            this.x = +x;
            this.y = +y;
            this.pressure = pressure || 0;
            this.time = time || Date.now();
        }
        distanceTo(start) {
            return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
        }
        equals(other) {
            return (this.x === other.x &&
                this.y === other.y &&
                this.pressure === other.pressure &&
                this.time === other.time);
        }
        velocityFrom(start) {
            return this.time !== start.time
                ? this.distanceTo(start) / (this.time - start.time)
                : 0;
        }
    }

    class Bezier {
        constructor(startPoint, control2, control1, endPoint, startWidth, endWidth) {
            this.startPoint = startPoint;
            this.control2 = control2;
            this.control1 = control1;
            this.endPoint = endPoint;
            this.startWidth = startWidth;
            this.endWidth = endWidth;
        }
        static fromPoints(points, widths) {
            const c2 = this.calculateControlPoints(points[0], points[1], points[2]).c2;
            const c3 = this.calculateControlPoints(points[1], points[2], points[3]).c1;
            return new Bezier(points[1], c2, c3, points[2], widths.start, widths.end);
        }
        static calculateControlPoints(s1, s2, s3) {
            const dx1 = s1.x - s2.x;
            const dy1 = s1.y - s2.y;
            const dx2 = s2.x - s3.x;
            const dy2 = s2.y - s3.y;
            const m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
            const m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };
            const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const dxm = m1.x - m2.x;
            const dym = m1.y - m2.y;
            const k = l2 / (l1 + l2);
            const cm = { x: m2.x + dxm * k, y: m2.y + dym * k };
            const tx = s2.x - cm.x;
            const ty = s2.y - cm.y;
            return {
                c1: new Point(m1.x + tx, m1.y + ty),
                c2: new Point(m2.x + tx, m2.y + ty),
            };
        }
        length() {
            const steps = 10;
            let length = 0;
            let px;
            let py;
            for (let i = 0; i <= steps; i += 1) {
                const t = i / steps;
                const cx = this.point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
                const cy = this.point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
                if (i > 0) {
                    const xdiff = cx - px;
                    const ydiff = cy - py;
                    length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
                }
                px = cx;
                py = cy;
            }
            return length;
        }
        point(t, start, c1, c2, end) {
            return (start * (1.0 - t) * (1.0 - t) * (1.0 - t))
                + (3.0 * c1 * (1.0 - t) * (1.0 - t) * t)
                + (3.0 * c2 * (1.0 - t) * t * t)
                + (end * t * t * t);
        }
    }

    class SignatureEventTarget {
        constructor() {
            try {
                this._et = new EventTarget();
            }
            catch (error) {
                this._et = document;
            }
        }
        addEventListener(type, listener, options) {
            this._et.addEventListener(type, listener, options);
        }
        dispatchEvent(event) {
            return this._et.dispatchEvent(event);
        }
        removeEventListener(type, callback, options) {
            this._et.removeEventListener(type, callback, options);
        }
    }

    function throttle(fn, wait = 250) {
        let previous = 0;
        let timeout = null;
        let result;
        let storedContext;
        let storedArgs;
        const later = () => {
            previous = Date.now();
            timeout = null;
            result = fn.apply(storedContext, storedArgs);
            if (!timeout) {
                storedContext = null;
                storedArgs = [];
            }
        };
        return function wrapper(...args) {
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
            }
            else if (!timeout) {
                timeout = window.setTimeout(later, remaining);
            }
            return result;
        };
    }

    class SignaturePad extends SignatureEventTarget {
        constructor(canvas, options = {}) {
            super();
            this.canvas = canvas;
            this._handleMouseDown = (event) => {
                if (event.buttons === 1) {
                    this._drawningStroke = true;
                    this._strokeBegin(event);
                }
            };
            this._handleMouseMove = (event) => {
                if (this._drawningStroke) {
                    this._strokeMoveUpdate(event);
                }
            };
            this._handleMouseUp = (event) => {
                if (event.buttons === 1 && this._drawningStroke) {
                    this._drawningStroke = false;
                    this._strokeEnd(event);
                }
            };
            this._handleTouchStart = (event) => {
                event.preventDefault();
                if (event.targetTouches.length === 1) {
                    const touch = event.changedTouches[0];
                    this._strokeBegin(touch);
                }
            };
            this._handleTouchMove = (event) => {
                event.preventDefault();
                const touch = event.targetTouches[0];
                this._strokeMoveUpdate(touch);
            };
            this._handleTouchEnd = (event) => {
                const wasCanvasTouched = event.target === this.canvas;
                if (wasCanvasTouched) {
                    event.preventDefault();
                    const touch = event.changedTouches[0];
                    this._strokeEnd(touch);
                }
            };
            this._handlePointerStart = (event) => {
                this._drawningStroke = true;
                event.preventDefault();
                this._strokeBegin(event);
            };
            this._handlePointerMove = (event) => {
                if (this._drawningStroke) {
                    event.preventDefault();
                    this._strokeMoveUpdate(event);
                }
            };
            this._handlePointerEnd = (event) => {
                this._drawningStroke = false;
                const wasCanvasTouched = event.target === this.canvas;
                if (wasCanvasTouched) {
                    event.preventDefault();
                    this._strokeEnd(event);
                }
            };
            this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
            this.minWidth = options.minWidth || 0.5;
            this.maxWidth = options.maxWidth || 2.5;
            this.throttle = ('throttle' in options ? options.throttle : 16);
            this.minDistance = ('minDistance' in options ? options.minDistance : 5);
            this.dotSize = options.dotSize || 0;
            this.penColor = options.penColor || 'black';
            this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
            this._strokeMoveUpdate = this.throttle
                ? throttle(SignaturePad.prototype._strokeUpdate, this.throttle)
                : SignaturePad.prototype._strokeUpdate;
            this._ctx = canvas.getContext('2d');
            this.clear();
            this.on();
        }
        clear() {
            const { _ctx: ctx, canvas } = this;
            ctx.fillStyle = this.backgroundColor;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            this._data = [];
            this._reset();
            this._isEmpty = true;
        }
        fromDataURL(dataUrl, options = {}) {
            return new Promise((resolve, reject) => {
                const image = new Image();
                const ratio = options.ratio || window.devicePixelRatio || 1;
                const width = options.width || this.canvas.width / ratio;
                const height = options.height || this.canvas.height / ratio;
                const xOffset = options.xOffset || 0;
                const yOffset = options.yOffset || 0;
                this._reset();
                image.onload = () => {
                    this._ctx.drawImage(image, xOffset, yOffset, width, height);
                    resolve();
                };
                image.onerror = (error) => {
                    reject(error);
                };
                image.crossOrigin = 'anonymous';
                image.src = dataUrl;
                this._isEmpty = false;
            });
        }
        toDataURL(type = 'image/png', encoderOptions) {
            switch (type) {
                case 'image/svg+xml':
                    return this._toSVG();
                default:
                    return this.canvas.toDataURL(type, encoderOptions);
            }
        }
        on() {
            this.canvas.style.touchAction = 'none';
            this.canvas.style.msTouchAction = 'none';
            this.canvas.style.userSelect = 'none';
            const isIOS = /Macintosh/.test(navigator.userAgent) && 'ontouchstart' in document;
            if (window.PointerEvent && !isIOS) {
                this._handlePointerEvents();
            }
            else {
                this._handleMouseEvents();
                if ('ontouchstart' in window) {
                    this._handleTouchEvents();
                }
            }
        }
        off() {
            this.canvas.style.touchAction = 'auto';
            this.canvas.style.msTouchAction = 'auto';
            this.canvas.style.userSelect = 'auto';
            this.canvas.removeEventListener('pointerdown', this._handlePointerStart);
            this.canvas.removeEventListener('pointermove', this._handlePointerMove);
            document.removeEventListener('pointerup', this._handlePointerEnd);
            this.canvas.removeEventListener('mousedown', this._handleMouseDown);
            this.canvas.removeEventListener('mousemove', this._handleMouseMove);
            document.removeEventListener('mouseup', this._handleMouseUp);
            this.canvas.removeEventListener('touchstart', this._handleTouchStart);
            this.canvas.removeEventListener('touchmove', this._handleTouchMove);
            this.canvas.removeEventListener('touchend', this._handleTouchEnd);
        }
        isEmpty() {
            return this._isEmpty;
        }
        fromData(pointGroups, { clear = true } = {}) {
            if (clear) {
                this.clear();
            }
            this._fromData(pointGroups, this._drawCurve.bind(this), this._drawDot.bind(this));
            this._data = clear ? pointGroups : this._data.concat(pointGroups);
        }
        toData() {
            return this._data;
        }
        _strokeBegin(event) {
            this.dispatchEvent(new CustomEvent('beginStroke', { detail: event }));
            const newPointGroup = {
                dotSize: this.dotSize,
                minWidth: this.minWidth,
                maxWidth: this.maxWidth,
                penColor: this.penColor,
                points: [],
            };
            this._data.push(newPointGroup);
            this._reset();
            this._strokeUpdate(event);
        }
        _strokeUpdate(event) {
            if (this._data.length === 0) {
                this._strokeBegin(event);
                return;
            }
            this.dispatchEvent(new CustomEvent('beforeUpdateStroke', { detail: event }));
            const x = event.clientX;
            const y = event.clientY;
            const pressure = event.pressure !== undefined
                ? event.pressure
                : event.force !== undefined
                    ? event.force
                    : 0;
            const point = this._createPoint(x, y, pressure);
            const lastPointGroup = this._data[this._data.length - 1];
            const lastPoints = lastPointGroup.points;
            const lastPoint = lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
            const isLastPointTooClose = lastPoint
                ? point.distanceTo(lastPoint) <= this.minDistance
                : false;
            const { penColor, dotSize, minWidth, maxWidth } = lastPointGroup;
            if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
                const curve = this._addPoint(point);
                if (!lastPoint) {
                    this._drawDot(point, {
                        penColor,
                        dotSize,
                        minWidth,
                        maxWidth,
                    });
                }
                else if (curve) {
                    this._drawCurve(curve, {
                        penColor,
                        dotSize,
                        minWidth,
                        maxWidth,
                    });
                }
                lastPoints.push({
                    time: point.time,
                    x: point.x,
                    y: point.y,
                    pressure: point.pressure,
                });
            }
            this.dispatchEvent(new CustomEvent('afterUpdateStroke', { detail: event }));
        }
        _strokeEnd(event) {
            this._strokeUpdate(event);
            this.dispatchEvent(new CustomEvent('endStroke', { detail: event }));
        }
        _handlePointerEvents() {
            this._drawningStroke = false;
            this.canvas.addEventListener('pointerdown', this._handlePointerStart);
            this.canvas.addEventListener('pointermove', this._handlePointerMove);
            document.addEventListener('pointerup', this._handlePointerEnd);
        }
        _handleMouseEvents() {
            this._drawningStroke = false;
            this.canvas.addEventListener('mousedown', this._handleMouseDown);
            this.canvas.addEventListener('mousemove', this._handleMouseMove);
            document.addEventListener('mouseup', this._handleMouseUp);
        }
        _handleTouchEvents() {
            this.canvas.addEventListener('touchstart', this._handleTouchStart);
            this.canvas.addEventListener('touchmove', this._handleTouchMove);
            this.canvas.addEventListener('touchend', this._handleTouchEnd);
        }
        _reset() {
            this._lastPoints = [];
            this._lastVelocity = 0;
            this._lastWidth = (this.minWidth + this.maxWidth) / 2;
            this._ctx.fillStyle = this.penColor;
        }
        _createPoint(x, y, pressure) {
            const rect = this.canvas.getBoundingClientRect();
            const positionOnCanvasElement = {
                x: x - rect.left,
                y: y - rect.top,
            };
            const ratio = {
                x: this.canvas.clientWidth > 0
                    ? this.canvas.width / this.canvas.clientWidth
                    : 1,
                y: this.canvas.clientHeight > 0
                    ? this.canvas.height / this.canvas.clientHeight
                    : 1,
            };
            const position = {
                x: positionOnCanvasElement.x * ratio.x,
                y: positionOnCanvasElement.y * ratio.y,
            };
            return new Point(position.x, position.y, pressure, Date.now());
        }
        _addPoint(point) {
            const { _lastPoints } = this;
            _lastPoints.push(point);
            if (_lastPoints.length > 2) {
                if (_lastPoints.length === 3) {
                    _lastPoints.unshift(_lastPoints[0]);
                }
                const widths = this._calculateCurveWidths(_lastPoints[1], _lastPoints[2]);
                const curve = Bezier.fromPoints(_lastPoints, widths);
                _lastPoints.shift();
                return curve;
            }
            return null;
        }
        _calculateCurveWidths(startPoint, endPoint) {
            const velocity = this.velocityFilterWeight * endPoint.velocityFrom(startPoint) +
                (1 - this.velocityFilterWeight) * this._lastVelocity;
            const newWidth = this._strokeWidth(velocity);
            const widths = {
                end: newWidth,
                start: this._lastWidth,
            };
            this._lastVelocity = velocity;
            this._lastWidth = newWidth;
            return widths;
        }
        _strokeWidth(velocity) {
            return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
        }
        _drawCurveSegment(x, y, width) {
            const ctx = this._ctx;
            ctx.moveTo(x, y);
            ctx.arc(x, y, width, 0, 2 * Math.PI, false);
            this._isEmpty = false;
        }
        _drawCurve(curve, options) {
            const ctx = this._ctx;
            const widthDelta = curve.endWidth - curve.startWidth;
            const drawSteps = Math.ceil(curve.length()) * 2;
            ctx.beginPath();
            ctx.fillStyle = options.penColor;
            for (let i = 0; i < drawSteps; i += 1) {
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
                const width = Math.min(curve.startWidth + ttt * widthDelta, options.maxWidth);
                this._drawCurveSegment(x, y, width);
            }
            ctx.closePath();
            ctx.fill();
        }
        _drawDot(point, options) {
            const ctx = this._ctx;
            const width = options.dotSize > 0
                ? options.dotSize
                : (options.minWidth + options.maxWidth) / 2;
            ctx.beginPath();
            this._drawCurveSegment(point.x, point.y, width);
            ctx.closePath();
            ctx.fillStyle = options.penColor;
            ctx.fill();
        }
        _fromData(pointGroups, drawCurve, drawDot) {
            for (const group of pointGroups) {
                const { penColor, dotSize, minWidth, maxWidth, points } = group;
                if (points.length > 1) {
                    for (let j = 0; j < points.length; j += 1) {
                        const basicPoint = points[j];
                        const point = new Point(basicPoint.x, basicPoint.y, basicPoint.pressure, basicPoint.time);
                        this.penColor = penColor;
                        if (j === 0) {
                            this._reset();
                        }
                        const curve = this._addPoint(point);
                        if (curve) {
                            drawCurve(curve, {
                                penColor,
                                dotSize,
                                minWidth,
                                maxWidth,
                            });
                        }
                    }
                }
                else {
                    this._reset();
                    drawDot(points[0], {
                        penColor,
                        dotSize,
                        minWidth,
                        maxWidth,
                    });
                }
            }
        }
        _toSVG() {
            const pointGroups = this._data;
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const minX = 0;
            const minY = 0;
            const maxX = this.canvas.width / ratio;
            const maxY = this.canvas.height / ratio;
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', this.canvas.width.toString());
            svg.setAttribute('height', this.canvas.height.toString());
            this._fromData(pointGroups, (curve, { penColor }) => {
                const path = document.createElement('path');
                if (!isNaN(curve.control1.x) &&
                    !isNaN(curve.control1.y) &&
                    !isNaN(curve.control2.x) &&
                    !isNaN(curve.control2.y)) {
                    const attr = `M ${curve.startPoint.x.toFixed(3)},${curve.startPoint.y.toFixed(3)} ` +
                        `C ${curve.control1.x.toFixed(3)},${curve.control1.y.toFixed(3)} ` +
                        `${curve.control2.x.toFixed(3)},${curve.control2.y.toFixed(3)} ` +
                        `${curve.endPoint.x.toFixed(3)},${curve.endPoint.y.toFixed(3)}`;
                    path.setAttribute('d', attr);
                    path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
                    path.setAttribute('stroke', penColor);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke-linecap', 'round');
                    svg.appendChild(path);
                }
            }, (point, { penColor, dotSize, minWidth, maxWidth }) => {
                const circle = document.createElement('circle');
                const size = dotSize > 0 ? dotSize : (minWidth + maxWidth) / 2;
                circle.setAttribute('r', size.toString());
                circle.setAttribute('cx', point.x.toString());
                circle.setAttribute('cy', point.y.toString());
                circle.setAttribute('fill', penColor);
                svg.appendChild(circle);
            });
            const prefix = 'data:image/svg+xml;base64,';
            const header = '<svg' +
                ' xmlns="http://www.w3.org/2000/svg"' +
                ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
                ` viewBox="${minX} ${minY} ${this.canvas.width} ${this.canvas.height}"` +
                ` width="${maxX}"` +
                ` height="${maxY}"` +
                '>';
            let body = svg.innerHTML;
            if (body === undefined) {
                const dummy = document.createElement('dummy');
                const nodes = svg.childNodes;
                dummy.innerHTML = '';
                for (let i = 0; i < nodes.length; i += 1) {
                    dummy.appendChild(nodes[i].cloneNode(true));
                }
                body = dummy.innerHTML;
            }
            const footer = '</svg>';
            const data = header + body + footer;
            return prefix + btoa(data);
        }
    }

    return SignaturePad;

}));
//# sourceMappingURL=signature_pad.umd.js.map
