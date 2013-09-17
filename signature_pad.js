/*!
 * Signature Pad v1.1.0
 * https://github.com/szimek/signature_pad
 *
 * Copyright 2013 Szymon Nowak
 * Released under the MIT license
 *
 * The main idea and some parts of the code (e.g. drawing variable width Bézier curve) are taken from:
 * http://corner.squareup.com/2012/07/smoother-signatures.html
 *
 * Implementation of interpolation using cubic Bézier curves is taken from:
 * http://benknowscode.wordpress.com/2012/09/14/path-interpolation-using-cubic-bezier-and-control-point-estimation-in-javascript
 *
 * Algorithm for approximated length of a Bézier curve is taken from:
 * http://www.lemoda.net/maths/bezier-length/index.html
 *
 */
var SignaturePad = (function (document) {
    "use strict";

    var SignaturePad = function (canvas, options) {
        var self = this,
            opts = options || {};

        this.opts = {
            velocityFilterWeight: 0.7,
            minWidth: 0.5,
            maxWidth: 2.5,
            color: "black",
            dotSize: function () {
                return (this.opts.minWidth + this.opts.maxWidth) / 2;
            },
            record: true
        };
        this.config(opts);

        this._canvas = canvas;
        this._ctx   = canvas.getContext("2d");
        this._resetRecords();
        this._reset();

        // Handle mouse events
        this._mouseButtonDown = false;

        canvas.addEventListener("mousedown", function (event) {
            if (event.which === 1) {
                self._mouseButtonDown = true;
                self._strokeStart(event);
            }
        });

        canvas.addEventListener("mousemove", function (event) {
            if (self._mouseButtonDown) {
                self._strokeFromEvent(event);
            }
        });

        document.addEventListener("mouseup", function (event) {
            if (event.which === 1 && self._mouseButtonDown) {
                self._mouseButtonDown = false;
            }
            self._strokeEnd();
        });

        // Handle touch events
        canvas.addEventListener("touchstart", function (event) {
            var touch = event.changedTouches[0];
            self._strokeStart(touch);
        });

        canvas.addEventListener("touchmove", function (event) {
            // Prevent scrolling;
            event.preventDefault();

            var touch = event.changedTouches[0];
            self._strokeFromEvent(touch);
        });

        document.addEventListener("touchend", function (event) {
            var wasCanvasTouched = event.target === self._canvas;
            if (wasCanvasTouched) {
                self._strokeEnd();
            }
        });
    };

    SignaturePad.prototype.config = function(options) {
        for (var key in this.opts) {
            if (key in options) {
                this.opts[key] = options[key];
            }
        }
    };

    SignaturePad.prototype._resetRecords = function () {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.records = [];
        this._recording = false;
    };

    SignaturePad.prototype.clear = function () {
        if (this._replaying) {
            this._replaying = false;
        }
        this._resetRecords();
        this._reset();
    };

    SignaturePad.prototype.replay = function () {
        var self = this,
            i = 0,
            length = this.records.length;

        self._replaying = true;
        self._recording = false; // if not, new stroke will be appended to the end and result in a long silence
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        function replay() {
            if (!self._replaying) {// interrupt by clear()
                return;
            }
            var step = self.records[i], nextStep;
            self._replayStep(step);
            i = i + 1;
            if (i === length) {
                self._replaying = false;
                return;
            } else {
                nextStep = self.records[i];
                window.setTimeout(replay, nextStep.point.time - step.point.time);
            }
        }

        if (length > 0) {
            replay();
        }
    };

    SignaturePad.prototype.toDataURL = function (imageType, quality) {
        return this._canvas.toDataURL(arguments);
    };

    SignaturePad.prototype.fromDataURL = function (dataUrl) {
        var image = new Image();
        image.src = dataUrl;
        this._ctx.drawImage(image, 0, 0, this._canvas.width, this._canvas.height);
    };

    SignaturePad.prototype.isEmpty = function () {
        return this._isEmpty;
    };

    SignaturePad.prototype._reset = function () {
        // record a dummy point to keep timestamp
        this._recordStep(new Step(new Point(), "reset"));
        this.points = [];
        this._lastVelocity = 0;
        this._lastWidth = (this.opts.minWidth + this.opts.maxWidth) / 2;
        this._isEmpty = true;
        this._ctx.fillStyle = this.opts.color;
    };

    function Step (point, type) {
        this.type = type;
        this.point = point;
    }

    SignaturePad.prototype._recordStep = function (step) {
        if (this.opts.record && !this._replaying && this._recording) {
            this.records.push(step);
        }
    };

    SignaturePad.prototype._createPoint = function (event) {
        var rect = this._canvas.getBoundingClientRect();
        return new Point(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    };

    SignaturePad.prototype._addPoint = function (point) {
        var points = this.points,
            c2, c3,
            curve, tmp;

        this._recordStep(new Step(point));

        points.push(point);

        if (points.length > 2) {
            // To reduce the initial lag make it work with 3 points
            // by copying the first point to the beginning
            if (points.length === 3) points.unshift(points[0]);

            tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
            c2 = tmp.c2;
            tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
            c3 = tmp.c1;
            curve = new Bezier(points[1], c2, c3, points[2]);
            this._addCurve(curve);

            // Remove the first element from the list,
            // so that we always have no more than 4 points in points array.
            points.shift();
        }
    };

    SignaturePad.prototype._addDot = function (point) {
        var ctx = this._ctx,
            dotSize = typeof(this.opts.dotSize) === "function" ? this.opts.dotSize.call(this) : this.opts.dotSize;

        this._recordStep(new Step(point, "dot"));

        ctx.beginPath();
        this._drawPoint(point.x, point.y, dotSize);
        ctx.closePath();
        ctx.fill();
    };

    SignaturePad.prototype._replayStep = function (step) {
        if (step.type === "dot") {
            this._addDot(step.point);
        } else if (step.type === "reset") {
            this._reset();
        } else {
            this._addPoint(step.point);
        }
    };

    SignaturePad.prototype._strokeStart = function (event) {
        if (this.opts.record && !this._recording) {
            this._resetRecords();
            this._recording = true;
        }
        this._reset();
        this._strokeFromEvent(event);
    };

    SignaturePad.prototype._strokeFromEvent = function (event) {
        var point = this._createPoint(event);
        this._addPoint(point);
    };

    SignaturePad.prototype._strokeEnd = function () {
        var canDrawCurve = this.points.length > 2,
            point = this.points[0];

        if (!canDrawCurve && point) {
            this._addDot(point);
        }
    };

    SignaturePad.prototype._calculateCurveControlPoints = function (s1, s2, s3) {
        var dx1 = s1.x - s2.x, dy1 = s1.y - s2.y,
            dx2 = s2.x - s3.x, dy2 = s2.y - s3.y,

            m1 = {x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0},
            m2 = {x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0},

            l1 = Math.sqrt(dx1*dx1 + dy1*dy1),
            l2 = Math.sqrt(dx2*dx2 + dy2*dy2),

            dxm = (m1.x - m2.x),
            dym = (m1.y - m2.y),

            k = l2 / (l1 + l2),
            cm = {x: m2.x + dxm*k, y: m2.y + dym*k},

            tx = s2.x - cm.x,
            ty = s2.y - cm.y;

        return {
            c1: new Point(m1.x + tx, m1.y + ty),
            c2: new Point(m2.x + tx, m2.y + ty)
        };
    };

    SignaturePad.prototype._addCurve = function (curve) {
        var startPoint = curve.startPoint,
            endPoint = curve.endPoint,
            velocity, newWidth;

        velocity = endPoint.velocityFrom(startPoint);
        velocity = this.opts.velocityFilterWeight * velocity
            + (1 - this.opts.velocityFilterWeight) * this._lastVelocity;

        newWidth = this._strokeWidth(velocity);
        this._drawCurve(curve, this._lastWidth, newWidth);

        this._lastVelocity = velocity;
        this._lastWidth = newWidth;
    };

    SignaturePad.prototype._drawPoint = function (x, y, size) {
        var ctx = this._ctx;

        ctx.moveTo(x, y);
        ctx.arc(x, y, size, 0 , 2 * Math.PI, false);
        this._isEmpty = false;
    };

    SignaturePad.prototype._drawCurve = function (curve, startWidth, endWidth) {
        var ctx = this._ctx,
            widthDelta = endWidth - startWidth,
            drawSteps, width, i, t, tt, ttt, u, uu, uuu, x, y;

        drawSteps = Math.floor(curve.length());
        ctx.beginPath();
        for (i = 0; i < drawSteps; i++) {
            // Calculate the Bezier (x, y) coordinate for this step.
            t = i / drawSteps;
            tt = t * t;
            ttt = tt * t;
            u = 1 - t;
            uu = u * u;
            uuu = uu * u;

            x = uuu * curve.startPoint.x;
            x += 3 * uu * t * curve.control1.x;
            x += 3 * u * tt * curve.control2.x;
            x += ttt * curve.endPoint.x;

            y = uuu * curve.startPoint.y;
            y += 3 * uu * t * curve.control1.y;
            y += 3 * u * tt * curve.control2.y;
            y += ttt * curve.endPoint.y;

            width = startWidth + ttt * widthDelta;
            this._drawPoint(x, y, width);
        }
        ctx.closePath();
        ctx.fill();
    };

    SignaturePad.prototype._strokeWidth = function (velocity) {
        return Math.max(this.opts.maxWidth / (velocity + 1), this.opts.minWidth);
    };


    var Point = function (x, y, time) {
        this.x = x;
        this.y = y;
        this.time = time || new Date().getTime();
    };

    Point.prototype.velocityFrom = function (start) {
        return this.distanceTo(start) / (this.time - start.time);
    };

    Point.prototype.distanceTo = function (start) {
        return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
    };

    var Bezier = function (startPoint, control1, control2, endPoint) {
        this.startPoint = startPoint;
        this.control1 = control1;
        this.control2 = control2;
        this.endPoint = endPoint;
    };

    // Returns approximated length
    Bezier.prototype.length = function () {
        var steps = 10,
            length = 0,
            i, t, cx, cy, px, py, xdiff, ydiff;

        for (i = 0; i <= steps; i++) {
            t = i / steps;
            cx = this._point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
            cy = this._point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
            if (i > 0) {
                xdiff = cx - px;
                ydiff = cy - py;
                length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
            }
            px = cx;
            py = cy;
        }
        return length;
    };

    Bezier.prototype._point = function (t, start, c1, c2, end) {
        return          start * (1.0 - t) * (1.0 - t)  * (1.0 - t)
               + 3.0 *  c1    * (1.0 - t) * (1.0 - t)  * t
               + 3.0 *  c2    * (1.0 - t) * t          * t
               +        end   * t         * t          * t;
    };

    return SignaturePad;
})(document);
