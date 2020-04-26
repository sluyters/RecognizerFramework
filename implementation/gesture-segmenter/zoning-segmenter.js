const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Path = require('../../framework/gestures/StrokeData').Path;

const xBound = 120;
const zBound = 60;

class Segmenter {
    constructor() {
        this.strokeData = null;
        this.minFrames = 10;
        this.maxFrames = 60; // 1 second
        this.numberPauseFrames = 30; // 0.5 second 
        this.pauseCount = 0;
    }

    segment(frame) {
        // Increment pause count
        this.pauseCount = Math.max(this.pauseCount - 1, 0);
        if (this.pauseCount != 0) {
            return { success: false, segment: null }; 
        }
        if (isWithinBounds(frame)) {
            // At least one hand is in the zone
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
                    strokePath.addPoint(frame['articulations'][articulation]);
                });
            } else {
                Object.keys(frame['articulations']).forEach(function(articulation) {
                    let stroke = this.strokeData.strokes[0];
                    let strokePath = stroke.paths[articulation];
                    strokePath.addPoint(frame['articulations'][articulation]);
                }.bind(this));
            }
            this.frameCount++;
        } else if (this.frameCount > this.minFrames) {
            // Hands outside of the zone & enough frames
            let oldStrokeData = this.strokeData;
            this.strokeData = null;
            this.frameCount = 0;
            return { success: true, segment: oldStrokeData };
        } else {
            // Hands outside of the zone and not enough frames
            this.strokeData = null;
            this.frameCount = 0;
        }
        return { success: false, segment: null };
    }

    notifyRecognition() {
        this.pauseCount = this.numberPauseFrames;
    }
}

function isWithinBounds(frame) {
    let withinBounds = false;
    if (frame.hasLeftHand) {
        let x = frame.articulations.leftPalmPosition.x;
        let z = frame.articulations.leftPalmPosition.z;
        withinBounds = x < xBound && x > -xBound && z < zBound && z > -zBound;
    } 
    if (!withinBounds && frame.hasRightHand) {
        let x = frame.articulations.rightPalmPosition.x;
        let z = frame.articulations.rightPalmPosition.z;
        withinBounds = x < xBound && x > -xBound && z < zBound && z > -zBound;
    }
    return withinBounds;
}

module.exports = {
    Segmenter
};