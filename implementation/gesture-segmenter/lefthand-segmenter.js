const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Path = require('../../framework/gestures/StrokeData').Path;
const Point = require('../../framework/gestures/Point').Point3D;

class Segmenter {
    constructor(options) {
        this.minFrames = options.minSegmentLength;
        this.maxFrames = options.maxSegmentLength;
        this.strokeData = null;
        this.frameCount = 0;
    }

    segment(frame) {
        if (frame.hasLeftHand) {
            if (this.frameCount >= this.maxFrames) {
                // Max number of frames reached
                let oldStrokeData = this.strokeData;
                this.strokeData = null;
                this.frameCount = 0;
                return { success: true, segment: oldStrokeData };
            } 
            if (this.strokeData === null) {
                // Initialize strokeData
                this.strokeData = new StrokeData();
                let stroke = new Stroke();
                this.strokeData.addStroke(stroke);
                Object.keys(frame['articulations']).forEach(function(articulation) {
                    let strokePath = new Path(articulation);
                    stroke.addPath(articulation, strokePath);
                    // Quick hack to remove left hand
                    if (articulation.includes("left")) {
                        strokePath.addPoint(new Point(0, 0, 0, frame.timestamp));
                    } else {
                        strokePath.addPoint(frame['articulations'][articulation]);
                    }
                });
            } else {
                Object.keys(frame['articulations']).forEach(function(articulation) {
                    let stroke = this.strokeData.strokes[0];
                    let strokePath = stroke.paths[articulation];
                    // Quick hack to remove left hand
                    if (articulation.includes("left")) {
                        strokePath.addPoint(new Point(0, 0, 0, frame.timestamp));
                    } else {
                        strokePath.addPoint(frame['articulations'][articulation]);
                    }
                }.bind(this));
            }
            this.frameCount++;
        } else if (this.frameCount > this.minFrames) {
            // Left hand removed and enough frames
            let oldStrokeData = this.strokeData;
            this.strokeData = null;
            this.frameCount = 0;
            return { success: true, segment: oldStrokeData };
        } else {
            // Left hand removed and not enough frames
            this.strokeData = null;
            this.frameCount = 0;
        }
        return { success: false, segment: null };
    }

    notifyRecognition() {
        // Do nothing
    }
}

module.exports = {
    Segmenter
};