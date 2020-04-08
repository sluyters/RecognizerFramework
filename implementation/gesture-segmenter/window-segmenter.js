class Segmenter {
    constructor() {
        this.frameBuffer = [];
        this.minFrames = 10;
        this.maxFrames = 180;
    }

    segment(frame) {
        for (const hand of frame.hands) {
            if (hand.type === 'left') {
                this.frameBuffer.push(frame);
            } else if (this.frameBuffer.length > this.minFrames) {
                let oldFrameBuffer = this.frameBuffer;
                this.frameBuffer = [];
                return { success: true, frames: oldFrameBuffer };
            }
        }
        if (this.frameBuffer.length >= this.maxFrames) {
            let oldFrameBuffer = this.frameBuffer;
            this.frameBuffer = [];
            return { success: true, frames: oldFrameBuffer };
        }
        return { success: false, frames: [] };
    }
}

module.exports = {
    Segmenter
};