
// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
//
// opt_canvas (an HTMLCanvasElement) and opt_context (a
// WebGLRenderingContext) can be passed in to make the hit detection
// more precise -- only opaque pixels will be considered as the start
// of a drag action.
function CameraController(element, opt_canvas, opt_context) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;

    if (opt_canvas)
        this.canvas_ = opt_canvas;

    if (opt_context)
        this.context_ = opt_context;

    function mouseDown(ev) {
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
        var dragging = false;
        if (controller.canvas_ && controller.context_) {
            var rect = controller.canvas_.getBoundingClientRect();
            // Transform the event's x and y coordinates into the coordinate
            // space of the canvas
            var canvasRelativeX = ev.pageX - rect.left;
            var canvasRelativeY = ev.pageY - rect.top;
            var canvasWidth = controller.canvas_.width;
            var canvasHeight = controller.canvas_.height;

            // Read back a small portion of the frame buffer around this point
            if (canvasRelativeX > 0 && canvasRelativeX < canvasWidth &&
                canvasRelativeY > 0 && canvasRelativeY < canvasHeight) {
                var pixels = new Uint8Array(1);
                controller.context_.readPixels(canvasRelativeX,
                                               canvasHeight - canvasRelativeY,
                                               1,
                                               1,
                                               controller.context_.RGBA,
                                               controller.context_.UNSIGNED_BYTE,
                                               pixels);
                // See whether this pixel has an alpha value of >= about 10%
                if (pixels[3] > (255.0 / 10.0)) {
                    dragging = true;
                }
            }
        } else {
            dragging = true;
        }

        controller.dragging = dragging;
    }

    function mouseMove(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    }

    function mouseUp(ev) {
        controller.dragging = false;
    }

    element.addEventListener("mousedown", mouseDown, false);
    element.addEventListener("mousemove", mouseMove, false);
    element.addEventListener("mouseup", mouseUp, false);

    var activeTouchIdentifier;

    function findActiveTouch(touches) {
        for (var ii = 0; ii < touches.length; ++ii) {
            if (touches.item(ii).identifier == activeTouchIdentifier) {
                return touches.item(ii);
            }
        }
        return null;
    }

    function touchStart(ev) {
        if (controller.dragging || ev.targetTouches.length == 0) {
            return;
        }
        var touch = ev.targetTouches.item(0);
        mouseDown(touch);
        if (controller.dragging) {
            activeTouchIdentifier = touch.identifier;
        }
        ev.preventDefault();
    }

    function touchMove(ev) {
        if (!controller.dragging) {
            return;
        }
        var touch = findActiveTouch(ev.changedTouches);
        if (touch) {
            mouseMove(touch);
        }
        ev.preventDefault();
    }

    function touchEnd(ev) {
        var touch = findActiveTouch(ev.changedTouches);
        if (touch) {
            mouseUp(touch);
        }
        ev.preventDefault();
    }

    element.addEventListener("touchstart", touchStart, false);
    element.addEventListener("touchmove", touchMove, false);
    element.addEventListener("touchend", touchEnd, false);
    element.addEventListener("touchcancel", touchEnd, false);
}
