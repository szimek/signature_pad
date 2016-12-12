var SignaturePad = (function (document) {
    "use strict";

    var SignaturePad = function (canvas, options) {
        var self = this,
            opts = options || {};

        this.velocityFilterWeight = opts.velocityFilterWeight || 0.7;
        this.minWidth = opts.minWidth || 0.5;
        this.maxWidth = opts.maxWidth || 2.5;
        this.dotSize = opts.dotSize || function () {
            return (this.minWidth + this.maxWidth) / 2;
        };
        this.penColor = opts.penColor || "black";
        this.backgroundColor = opts.backgroundColor || "rgba(0,0,0,0)";
        this.onEnd = opts.onEnd;
        this.onBegin = opts.onBegin;

        this._versions = [];
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");

        if (opts.initValue) {
            this._hasInitValue = true;
            this.fromDataURL(opts.initValue, opts.initValueCallback);
        } else {
            this._hasInitValue = false;
            this.clear();
        }

        // we need add these inline so they are available to unbind while still having
        //  access to 'self' we could use _.bind but it's not worth adding a dependency
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
            if (event.targetTouches.length == 1) {
                var touch = event.changedTouches[0];
                self._strokeBegin(touch);
             }
        };

        this._handleTouchMove = function (event) {
            // Prevent scrolling.
            event.preventDefault();

            var touch = event.targetTouches[0];
            self._strokeUpdate(touch);
        };

        this._handleTouchEnd = function (event) {
            var wasCanvasTouched = event.target === self._canvas;
            if (wasCanvasTouched) {
                event.preventDefault();
                self._strokeEnd(event);
            }
        };

        this._handleMouseEvents();
        this._handleTouchEvents();
    };

    SignaturePad.prototype._resize = function (width, height) {
        this._canvas.width = width;
        this._canvas.height = height;
    };
    
    SignaturePad.prototype.resize = function (width, height, scaleDown) {
        // Dont do anything if width and height have not changed
        if (this._canvas.width === width && this._canvas.height === height) {
            return;
        }

        // If signature is empty, just resize.
        if (this.isEmpty()) {
            return this._resize(width, height);
        }

        // Get the cropped image inside the canvas so that we can check if we need
        // to resize the image before we resize the canvas
        var croppedImageData = this.getImageData();

        // If the cropped image will fit inside the new canvas size,
        // we can just center it inside the new canvas
        if (width >= croppedImageData.width && height >= croppedImageData.height) {
            var centerShiftX = (width - croppedImageData.width) / 2;
            var centerShiftY = (height - croppedImageData.height) / 2;
            this._resize(width, height);
            this._ctx.putImageData(croppedImageData, centerShiftX, centerShiftY, 0, 0, croppedImageData.width, croppedImageData.height);
            return;
        }

        // If the cropped image will not fit inside the new canvas size
        // we can either scale the image down to fit or just clear the canvas 
        if (!scaleDown) {
            return this._resize(width, height);
        }

        var croppedCanvas = this._createCanvasFromImageData(croppedImageData);
        this._resize(width, height);
        this.fromImage(croppedCanvas);
    };

    SignaturePad.prototype.undo = function (cb) {
        // Wont undo initial value
        if (this._versions.length > 1) {
            this._versions.shift();
            this._clear();
            this._fromDataURL(this._versions[0], cb);
            // If there is only one version left
            // and there was no initial value,
            // the canvas is empty
            if (this._versions.length === 1 && !this._hasInitValue) {
                this._isEmpty = true;
            }
        } else if (typeof cb === 'function') {
            cb();
        }
    };

    SignaturePad.prototype._clear = function () {
        var ctx = this._ctx,
            canvas = this._canvas;

        ctx.fillStyle = this.backgroundColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this._reset();
    };

    SignaturePad.prototype.clear = function () {
        if (!this.isEmpty()) {
            this._clear();
            this._versions.unshift(this.toDataURL());
        }
    };

    SignaturePad.prototype.toDataURL = function (imageType, quality) {
        var canvas = this._canvas;
        return canvas.toDataURL.apply(canvas, arguments);
    };

    SignaturePad.prototype.toDataURLCropped = function (imageType, quality) {
        var canvas = this.croppedCanvas();
        return canvas.toDataURL.apply(canvas, arguments);
    };

    SignaturePad.prototype.getImageData = function () {
        var imgWidth = this._ctx.canvas.width;
        var imgHeight = this._ctx.canvas.height;
        var imageData = this._ctx.getImageData(0, 0, imgWidth, imgHeight);
        if (this.isEmpty()) {
            return imageData;
        }

        var data = imageData.data;
        var getAlpha = function(x, y) {
            return data[(imgWidth * y + x) * 4 + 3];
        };
        var scanY = function (fromTop) {
            var offset = fromTop ? 1 : -1;

            // loop through each row
            for(var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {

                // loop through each column
                for(var x = 0; x < imgWidth; x++) {
                    if (getAlpha(x, y)) {
                        return y;
                    }
                }
            }
            return null; // all image is white
        };
        var scanX = function (fromLeft) {
            var offset = fromLeft? 1 : -1;

            // loop through each column
            for(var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {

                // loop through each row
                for(var y = 0; y < imgHeight; y++) {
                    if (getAlpha(x, y)) {
                        return x;
                    }
                }
            }
            return null; // all image is white
        };
        var cropTop = scanY(true);
        var cropBottom = scanY(false);
        var cropLeft = scanX(true);
        var cropRight = scanX(false);
        // If the signature has a 1 pixel width, cropRight and cropLeft would be the same value
        // hence the need to add an extra pixel to the width and height values
        var width = cropRight - cropLeft + 1;
        var height = cropBottom - cropTop + 1;
        return this._ctx.getImageData(cropLeft, cropTop, width, height);
    };

    SignaturePad.prototype._createCanvasFromImageData = function (imageData) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        canvas.width = imageData.width;
        canvas.height = imageData.height;
        context.clearRect(0, 0, imageData.width, imageData.height);
        context.putImageData(imageData, 0, 0);

        return canvas;
    };

    SignaturePad.prototype.croppedCanvas = function () {
        var croppedImageData = this.getImageData();
        return this._createCanvasFromImageData(croppedImageData);
    };

    SignaturePad.prototype.fromImage = function (image) {
        var width = this._canvas.width;
        var height = this._canvas.height;
        var hRatio = width / image.width;
        var vRatio = height / image.height;
        var ratio = Math.min(hRatio, vRatio, 1);
        var centerShiftX = (width - image.width * ratio) / 2;
        var centerShiftY = (height - image.height * ratio) / 2;
        var destWidth = image.width * ratio;
        var destHeight = image.height * ratio;
        this._ctx.clearRect(0, 0, width, height);
        this._ctx.drawImage(image, centerShiftX, centerShiftY, destWidth, destHeight);
    };

    SignaturePad.prototype._fromDataURL = function (dataUrl, cb) {
        var self = this,
            image = new Image();

        this._reset();
        image.src = dataUrl;
        image.onload = function () {
            self.fromImage(image);
            if (typeof cb === 'function') {
                cb();
            }
        };
        this._isEmpty = false;
    };

    SignaturePad.prototype.fromDataURL = function (dataUrl, cb) {
        this._fromDataURL(dataUrl, cb);
        this._versions.unshift(dataUrl);
    };

    SignaturePad.prototype._strokeUpdate = function (event) {
        var point = this._createPoint(event);
        this._addPoint(point);
    };

    SignaturePad.prototype._strokeBegin = function (event) {
        this._reset();
        this._strokeUpdate(event);
        if (typeof this.onBegin === 'function') {
            this.onBegin(event);
        }
    };

    SignaturePad.prototype._strokeDraw = function (point) {
        var ctx = this._ctx,
            dotSize = typeof(this.dotSize) === 'function' ? this.dotSize() : this.dotSize;

        ctx.beginPath();
        this._drawPoint(point.x, point.y, dotSize);
        ctx.closePath();
        ctx.fill();
    };

    SignaturePad.prototype._strokeEnd = function (event) {
        var canDrawCurve = this.points.length > 2,
            point = this.points[0];

        if (!canDrawCurve && point) {
            this._strokeDraw(point);
        }
        if (typeof this.onEnd === 'function') {
            this.onEnd(event);
        }

        this._versions.unshift(this.toDataURL());
    };

    SignaturePad.prototype._handleMouseEvents = function () {
        this._mouseButtonDown = false;

        this._canvas.addEventListener("mousedown", this._handleMouseDown);
        this._canvas.addEventListener("mousemove", this._handleMouseMove);
        document.addEventListener("mouseup", this._handleMouseUp);
    };

    SignaturePad.prototype._handleTouchEvents = function () {
        // Pass touch events to canvas element on mobile IE11 and Edge.
        this._canvas.style.msTouchAction = 'none';
        this._canvas.style.touchAction = 'none';

        this._canvas.addEventListener("touchstart", this._handleTouchStart);
        this._canvas.addEventListener("touchmove", this._handleTouchMove);
        this._canvas.addEventListener("touchend", this._handleTouchEnd);
    };

    SignaturePad.prototype.on = function () {
        this._handleMouseEvents();
        this._handleTouchEvents();
    };

    SignaturePad.prototype.off = function () {
        this._canvas.removeEventListener("mousedown", this._handleMouseDown);
        this._canvas.removeEventListener("mousemove", this._handleMouseMove);
        document.removeEventListener("mouseup", this._handleMouseUp);

        this._canvas.removeEventListener("touchstart", this._handleTouchStart);
        this._canvas.removeEventListener("touchmove", this._handleTouchMove);
        this._canvas.removeEventListener("touchend", this._handleTouchEnd);
    };

    SignaturePad.prototype.isEmpty = function () {
        return this._isEmpty;
    };

    SignaturePad.prototype._reset = function () {
        this.points = [];
        this._lastVelocity = 0;
        this._lastWidth = (this.minWidth + this.maxWidth) / 2;
        this._isEmpty = true;
        this._ctx.fillStyle = this.penColor;
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

        points.push(point);

        if (points.length > 2) {
            // To reduce the initial lag make it work with 3 points
            // by copying the first point to the beginning.
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
        velocity = this.velocityFilterWeight * velocity
            + (1 - this.velocityFilterWeight) * this._lastVelocity;

        newWidth = this._strokeWidth(velocity);
        this._drawCurve(curve, this._lastWidth, newWidth);

        this._lastVelocity = velocity;
        this._lastWidth = newWidth;
    };

    SignaturePad.prototype._drawPoint = function (x, y, size) {
        var ctx = this._ctx;

        ctx.moveTo(x, y);
        ctx.arc(x, y, size, 0, 2 * Math.PI, false);
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
        return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
    };


    var Point = function (x, y, time) {
        this.x = x;
        this.y = y;
        this.time = time || new Date().getTime();
    };

    Point.prototype.velocityFrom = function (start) {
        return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
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

    // Returns approximated length.
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
