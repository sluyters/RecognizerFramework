const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Path = require('../../framework/gestures/StrokeData').Path;

class Segmenter {
    
    constructor() {
        this.frameBuffer = null;
        this.windowWidth = 40; // 0.66 second
        this.numberIntervalFrames = 12; // 200ms
        this.numberPauseFrames = 60; // 1 second 
        this.intervalCount = 0;
        this.pauseCount = 0;
        this.bufferLength = 0;
    }

    segment(frame) {
        if (this.frameBuffer === null) {
            // Initialize frameBuffer
            this.frameBuffer = initBuffer(frame);
        } else {
            Object.keys(frame['articulations']).forEach((articulation) => {
                this.frameBuffer[articulation].push(frame['articulations'][articulation]);
                if (this.bufferLength >= this.windowWidth) {
                    // Shift items in buffer
                    this.frameBuffer[articulation].shift();
                }
            });
        }
        // Increment pause count
        this.pauseCount = Math.max(this.pauseCount - 1, 0);
        this.intervalCount = (this.intervalCount + 1) % this.numberIntervalFrames;
        if (this.bufferLength < this.windowWidth) {
            // Buffer not full
            this.bufferLength++;
            return { success: false, segment: null };
        } else if (this.pauseCount == 0 && this.intervalCount == 0 && (frame.hasLeftHand || frame.hasRightHand)) {
            let strokeData = new StrokeData();
            let stroke = new Stroke();
            strokeData.addStroke(stroke);
            // Buffer full & ready
            Object.keys(frame['articulations']).forEach((articulation) => {
                let strokePath = new Path(articulation);
                strokePath.setPoints(this.frameBuffer[articulation].slice());
                stroke.addPath(articulation, strokePath);
            });
            return { success: true, segment: strokeData };
        } else {
            // Pause
            return { success: false, segment: null };
        }
    }

    notifyRecognition() {
        this.pauseCount = this.numberPauseFrames;
    }
}

function initBuffer(frame) {
    let buffer = {};
    Object.keys(frame['articulations']).forEach((articulation) => {
        buffer[articulation] = [ frame['articulations'][articulation] ];
    });
    return buffer;
}

module.exports = {
    Segmenter
};