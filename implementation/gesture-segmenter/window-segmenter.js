class Segmenter {
    constructor() {
        this.frameBuffer = [];
        this.windowWidth = 60;
        this.numberPauseFrames = 80;
        this.pauseCount = 0;
    }

    segment(frame) {
        this.frameBuffer.push(frame);
        if (this.frameBuffer.length < this.windowWidth) {
            return { success: false, frames: [] };
        }
        this.frameBuffer.shift();
        this.pauseCount = (this.pauseCount + 1) % this.numberPauseFrames;
        if (this.pauseCount + 1 == this.numberPauseFrames) {
            return { success: true, frames: this.frameBuffer.slice() };
        }
        return { success: false, frames: [] };
    }
}

module.exports = {
    Segmenter
};