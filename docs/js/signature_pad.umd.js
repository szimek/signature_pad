/*!
 * Signature Pad v3.0.0-beta.4 | https://github.com/szimek/signature_pad
 * (c) 2021 Szymon Nowak | Released under the MIT license
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SignaturePad = factory());
})(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var Point = (function () {
        function Point(x, y, time) {
            this.x = x;
            this.y = y;
            this.time = time || Date.now();
        }
        Point.prototype.distanceTo = function (start) {
            return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
        };
        Point.prototype.equals = function (other) {
            return this.x === other.x && this.y === other.y && this.time === other.time;
        };
        Point.prototype.velocityFrom = function (start) {
            return this.time !== start.time
                ? this.distanceTo(start) / (this.time - start.time)
                : 0;
        };
        return Point;
    }());

    var Bezier = (function () {
        function Bezier(startPoint, control2, control1, endPoint, startWidth, endWidth) {
            this.startPoint = startPoint;
            this.control2 = control2;
            this.control1 = control1;
            this.endPoint = endPoint;
            this.startWidth = startWidth;
            this.endWidth = endWidth;
        }
        Bezier.fromPoints = function (points, widths) {
            var c2 = this.calculateControlPoints(points[0], points[1], points[2]).c2;
            var c3 = this.calculateControlPoints(points[1], points[2], points[3]).c1;
            return new Bezier(points[1], c2, c3, points[2], widths.start, widths.end);
        };
        Bezier.calculateControlPoints = function (s1, s2, s3) {
            var dx1 = s1.x - s2.x;
            var dy1 = s1.y - s2.y;
            var dx2 = s2.x - s3.x;
            var dy2 = s2.y - s3.y;
            var m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
            var m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };
            var l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            var l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            var dxm = m1.x - m2.x;
            var dym = m1.y - m2.y;
            var k = l2 / (l1 + l2);
            var cm = { x: m2.x + dxm * k, y: m2.y + dym * k };
            var tx = s2.x - cm.x;
            var ty = s2.y - cm.y;
            return {
                c1: new Point(m1.x + tx, m1.y + ty),
                c2: new Point(m2.x + tx, m2.y + ty)
            };
        };
        Bezier.prototype.length = function () {
            var steps = 10;
            var length = 0;
            var px;
            var py;
            for (var i = 0; i <= steps; i += 1) {
                var t = i / steps;
                var cx = this.point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
                var cy = this.point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
                if (i > 0) {
                    var xdiff = cx - px;
                    var ydiff = cy - py;
                    length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
                }
                px = cx;
                py = cy;
            }
            return length;
        };
        Bezier.prototype.point = function (t, start, c1, c2, end) {
            return (start * (1.0 - t) * (1.0 - t) * (1.0 - t))
                + (3.0 * c1 * (1.0 - t) * (1.0 - t) * t)
                + (3.0 * c2 * (1.0 - t) * t * t)
                + (end * t * t * t);
        };
        return Bezier;
    }());

    function throttle(fn, wait) {
        if (wait === void 0) { wait = 250; }
        var previous = 0;
        var timeout = null;
        var result;
        var storedContext;
        var storedArgs;
        var later = function () {
            previous = Date.now();
            timeout = null;
            result = fn.apply(storedContext, storedArgs);
            if (!timeout) {
                storedContext = null;
                storedArgs = [];
            }
        };
        return function wrapper() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var now = Date.now();
            var remaining = wait - (now - previous);
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

    var SignaturePad = (function (_super) {
        __extends(SignaturePad, _super);
        function SignaturePad(canvas, options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this) || this;
            _this.canvas = canvas;
            _this.options = options;
            _this._handleMouseDown = function (event) {
                if (event.which === 1) {
                    _this._mouseButtonDown = true;
                    _this._strokeBegin(event);
                }
            };
            _this._handleMouseMove = function (event) {
                if (_this._mouseButtonDown) {
                    _this._strokeMoveUpdate(event);
                }
            };
            _this._handleMouseUp = function (event) {
                if (event.which === 1 && _this._mouseButtonDown) {
                    _this._mouseButtonDown = false;
                    _this._strokeEnd(event);
                }
            };
            _this._handleTouchStart = function (event) {
                event.preventDefault();
                if (event.targetTouches.length === 1) {
                    var touch = event.changedTouches[0];
                    _this._strokeBegin(touch);
                }
            };
            _this._handleTouchMove = function (event) {
                event.preventDefault();
                var touch = event.targetTouches[0];
                _this._strokeMoveUpdate(touch);
            };
            _this._handleTouchEnd = function (event) {
                var wasCanvasTouched = event.target === _this.canvas;
                if (wasCanvasTouched) {
                    event.preventDefault();
                    var touch = event.changedTouches[0];
                    _this._strokeEnd(touch);
                }
            };
            _this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
            _this.minWidth = options.minWidth || 0.5;
            _this.maxWidth = options.maxWidth || 2.5;
            _this.throttle = ('throttle' in options ? options.throttle : 16);
            _this.minDistance = ('minDistance' in options ? options.minDistance : 5);
            _this.dotSize =
                options.dotSize ||
                    function dotSize() {
                        return (this.minWidth + this.maxWidth) / 2;
                    };
            _this.penColor = options.penColor || 'black';
            _this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
            _this._strokeMoveUpdate = _this.throttle
                ? throttle(SignaturePad.prototype._strokeUpdate, _this.throttle)
                : SignaturePad.prototype._strokeUpdate;
            _this._ctx = canvas.getContext('2d');
            _this.clear();
            _this.on();
            return _this;
        }
        SignaturePad.prototype.clear = function () {
            var _a = this, ctx = _a._ctx, canvas = _a.canvas;
            ctx.fillStyle = this.backgroundColor;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            this._data = [];
            this._reset();
            this._isEmpty = true;
        };
        SignaturePad.prototype.fromDataURL = function (dataUrl, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return new Promise(function (resolve, reject) {
                var image = new Image();
                var ratio = options.ratio || window.devicePixelRatio || 1;
                var width = options.width || _this.canvas.width / ratio;
                var height = options.height || _this.canvas.height / ratio;
                var xOffset = options.xOffset || 0;
                var yOffset = options.yOffset || 0;
                _this._reset();
                image.onload = function () {
                    _this._ctx.drawImage(image, xOffset, yOffset, width, height);
                    resolve();
                };
                image.onerror = function (error) {
                    reject(error);
                };
                image.crossOrigin = 'anonymous';
                image.src = dataUrl;
                _this._isEmpty = false;
            });
        };
        SignaturePad.prototype.toDataURL = function (type, encoderOptions) {
            if (type === void 0) { type = 'image/png'; }
            switch (type) {
                case 'image/svg+xml':
                    return this._toSVG();
                default:
                    return this.canvas.toDataURL(type, encoderOptions);
            }
        };
        SignaturePad.prototype.on = function () {
            this.canvas.style.touchAction = 'none';
            this.canvas.style.msTouchAction = 'none';
            if (window.PointerEvent) {
                this._handlePointerEvents();
            }
            else {
                this._handleMouseEvents();
                if ('ontouchstart' in window) {
                    this._handleTouchEvents();
                }
            }
        };
        SignaturePad.prototype.off = function () {
            this.canvas.style.touchAction = 'auto';
            this.canvas.style.msTouchAction = 'auto';
            this.canvas.removeEventListener('pointerdown', this._handleMouseDown);
            this.canvas.removeEventListener('pointermove', this._handleMouseMove);
            document.removeEventListener('pointerup', this._handleMouseUp);
            this.canvas.removeEventListener('mousedown', this._handleMouseDown);
            this.canvas.removeEventListener('mousemove', this._handleMouseMove);
            document.removeEventListener('mouseup', this._handleMouseUp);
            this.canvas.removeEventListener('touchstart', this._handleTouchStart);
            this.canvas.removeEventListener('touchmove', this._handleTouchMove);
            this.canvas.removeEventListener('touchend', this._handleTouchEnd);
        };
        SignaturePad.prototype.isEmpty = function () {
            return this._isEmpty;
        };
        SignaturePad.prototype.fromData = function (pointGroups) {
            var _this = this;
            this.clear();
            this._fromData(pointGroups, function (_a) {
                var color = _a.color, curve = _a.curve;
                return _this._drawCurve({ color: color, curve: curve });
            }, function (_a) {
                var color = _a.color, point = _a.point;
                return _this._drawDot({ color: color, point: point });
            });
            this._data = pointGroups;
        };
        SignaturePad.prototype.toData = function () {
            return this._data;
        };
        SignaturePad.prototype._strokeBegin = function (event) {
            var newPointGroup = {
                color: this.penColor,
                points: []
            };
            this.dispatchEvent(new CustomEvent("beginStroke", { detail: event }));
            this._data.push(newPointGroup);
            this._reset();
            this._strokeUpdate(event);
        };
        SignaturePad.prototype._strokeUpdate = function (event) {
            if (this._data.length === 0) {
                this._strokeBegin(event);
                return;
            }
            var x = event.clientX;
            var y = event.clientY;
            var point = this._createPoint(x, y);
            var lastPointGroup = this._data[this._data.length - 1];
            var lastPoints = lastPointGroup.points;
            var lastPoint = lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
            var isLastPointTooClose = lastPoint
                ? point.distanceTo(lastPoint) <= this.minDistance
                : false;
            var color = lastPointGroup.color;
            if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
                var curve = this._addPoint(point);
                if (!lastPoint) {
                    this._drawDot({ color: color, point: point });
                }
                else if (curve) {
                    this._drawCurve({ color: color, curve: curve });
                }
                lastPoints.push({
                    time: point.time,
                    x: point.x,
                    y: point.y
                });
            }
        };
        SignaturePad.prototype._strokeEnd = function (event) {
            this._strokeUpdate(event);
            this.dispatchEvent(new CustomEvent("endStroke", { detail: event }));
        };
        SignaturePad.prototype._handlePointerEvents = function () {
            this._mouseButtonDown = false;
            this.canvas.addEventListener('pointerdown', this._handleMouseDown);
            this.canvas.addEventListener('pointermove', this._handleMouseMove);
            document.addEventListener('pointerup', this._handleMouseUp);
        };
        SignaturePad.prototype._handleMouseEvents = function () {
            this._mouseButtonDown = false;
            this.canvas.addEventListener('mousedown', this._handleMouseDown);
            this.canvas.addEventListener('mousemove', this._handleMouseMove);
            document.addEventListener('mouseup', this._handleMouseUp);
        };
        SignaturePad.prototype._handleTouchEvents = function () {
            this.canvas.addEventListener('touchstart', this._handleTouchStart);
            this.canvas.addEventListener('touchmove', this._handleTouchMove);
            this.canvas.addEventListener('touchend', this._handleTouchEnd);
        };
        SignaturePad.prototype._reset = function () {
            this._lastPoints = [];
            this._lastVelocity = 0;
            this._lastWidth = (this.minWidth + this.maxWidth) / 2;
            this._ctx.fillStyle = this.penColor;
        };
        SignaturePad.prototype._createPoint = function (x, y) {
            var rect = this.canvas.getBoundingClientRect();
            return new Point(x - rect.left, y - rect.top, new Date().getTime());
        };
        SignaturePad.prototype._addPoint = function (point) {
            var _lastPoints = this._lastPoints;
            _lastPoints.push(point);
            if (_lastPoints.length > 2) {
                if (_lastPoints.length === 3) {
                    _lastPoints.unshift(_lastPoints[0]);
                }
                var widths = this._calculateCurveWidths(_lastPoints[1], _lastPoints[2]);
                var curve = Bezier.fromPoints(_lastPoints, widths);
                _lastPoints.shift();
                return curve;
            }
            return null;
        };
        SignaturePad.prototype._calculateCurveWidths = function (startPoint, endPoint) {
            var velocity = this.velocityFilterWeight * endPoint.velocityFrom(startPoint) +
                (1 - this.velocityFilterWeight) * this._lastVelocity;
            var newWidth = this._strokeWidth(velocity);
            var widths = {
                end: newWidth,
                start: this._lastWidth
            };
            this._lastVelocity = velocity;
            this._lastWidth = newWidth;
            return widths;
        };
        SignaturePad.prototype._strokeWidth = function (velocity) {
            return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
        };
        SignaturePad.prototype._drawCurveSegment = function (x, y, width) {
            var ctx = this._ctx;
            ctx.moveTo(x, y);
            ctx.arc(x, y, width, 0, 2 * Math.PI, false);
            this._isEmpty = false;
        };
        SignaturePad.prototype._drawCurve = function (_a) {
            var color = _a.color, curve = _a.curve;
            var ctx = this._ctx;
            var widthDelta = curve.endWidth - curve.startWidth;
            var drawSteps = Math.ceil(curve.length()) * 2;
            ctx.beginPath();
            ctx.fillStyle = color;
            for (var i = 0; i < drawSteps; i += 1) {
                var t = i / drawSteps;
                var tt = t * t;
                var ttt = tt * t;
                var u = 1 - t;
                var uu = u * u;
                var uuu = uu * u;
                var x = uuu * curve.startPoint.x;
                x += 3 * uu * t * curve.control1.x;
                x += 3 * u * tt * curve.control2.x;
                x += ttt * curve.endPoint.x;
                var y = uuu * curve.startPoint.y;
                y += 3 * uu * t * curve.control1.y;
                y += 3 * u * tt * curve.control2.y;
                y += ttt * curve.endPoint.y;
                var width = Math.min(curve.startWidth + ttt * widthDelta, this.maxWidth);
                this._drawCurveSegment(x, y, width);
            }
            ctx.closePath();
            ctx.fill();
        };
        SignaturePad.prototype._drawDot = function (_a) {
            var color = _a.color, point = _a.point;
            var ctx = this._ctx;
            var width = typeof this.dotSize === 'function' ? this.dotSize() : this.dotSize;
            ctx.beginPath();
            this._drawCurveSegment(point.x, point.y, width);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        };
        SignaturePad.prototype._fromData = function (pointGroups, drawCurve, drawDot) {
            for (var _i = 0, pointGroups_1 = pointGroups; _i < pointGroups_1.length; _i++) {
                var group = pointGroups_1[_i];
                var color = group.color, points = group.points;
                if (points.length > 1) {
                    for (var j = 0; j < points.length; j += 1) {
                        var basicPoint = points[j];
                        var point = new Point(basicPoint.x, basicPoint.y, basicPoint.time);
                        this.penColor = color;
                        if (j === 0) {
                            this._reset();
                        }
                        var curve = this._addPoint(point);
                        if (curve) {
                            drawCurve({ color: color, curve: curve });
                        }
                    }
                }
                else {
                    this._reset();
                    drawDot({
                        color: color,
                        point: points[0]
                    });
                }
            }
        };
        SignaturePad.prototype._toSVG = function () {
            var _this = this;
            var pointGroups = this._data;
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            var minX = 0;
            var minY = 0;
            var maxX = this.canvas.width / ratio;
            var maxY = this.canvas.height / ratio;
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', this.canvas.width.toString());
            svg.setAttribute('height', this.canvas.height.toString());
            this._fromData(pointGroups, function (_a) {
                var color = _a.color, curve = _a.curve;
                var path = document.createElement('path');
                if (!isNaN(curve.control1.x) &&
                    !isNaN(curve.control1.y) &&
                    !isNaN(curve.control2.x) &&
                    !isNaN(curve.control2.y)) {
                    var attr = "M " + curve.startPoint.x.toFixed(3) + "," + curve.startPoint.y.toFixed(3) + " " +
                        ("C " + curve.control1.x.toFixed(3) + "," + curve.control1.y.toFixed(3) + " ") +
                        (curve.control2.x.toFixed(3) + "," + curve.control2.y.toFixed(3) + " ") +
                        (curve.endPoint.x.toFixed(3) + "," + curve.endPoint.y.toFixed(3));
                    path.setAttribute('d', attr);
                    path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
                    path.setAttribute('stroke', color);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke-linecap', 'round');
                    svg.appendChild(path);
                }
            }, function (_a) {
                var color = _a.color, point = _a.point;
                var circle = document.createElement('circle');
                var dotSize = typeof _this.dotSize === 'function' ? _this.dotSize() : _this.dotSize;
                circle.setAttribute('r', dotSize.toString());
                circle.setAttribute('cx', point.x.toString());
                circle.setAttribute('cy', point.y.toString());
                circle.setAttribute('fill', color);
                svg.appendChild(circle);
            });
            var prefix = 'data:image/svg+xml;base64,';
            var header = '<svg' +
                ' xmlns="http://www.w3.org/2000/svg"' +
                ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
                (" viewBox=\"" + minX + " " + minY + " " + this.canvas.width + " " + this.canvas.height + "\"") +
                (" width=\"" + maxX + "\"") +
                (" height=\"" + maxY + "\"") +
                '>';
            var body = svg.innerHTML;
            if (body === undefined) {
                var dummy = document.createElement('dummy');
                var nodes = svg.childNodes;
                dummy.innerHTML = '';
                for (var i = 0; i < nodes.length; i += 1) {
                    dummy.appendChild(nodes[i].cloneNode(true));
                }
                body = dummy.innerHTML;
            }
            var footer = '</svg>';
            var data = header + body + footer;
            return prefix + btoa(data);
        };
        return SignaturePad;
    }(EventTarget));

    return SignaturePad;

}));
//# sourceMappingURL=signature_pad.umd.js.map
