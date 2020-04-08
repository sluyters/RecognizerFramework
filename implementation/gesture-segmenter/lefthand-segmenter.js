class Segmenter {
    constructor() {
        this.frameBuffer = [];
        this.minFrames = 10;
        this.maxFrames = 180;
    }

    segment(frame) {
        let hasLeftHand = false;
        for (const hand of frame.hands) {
            if (hand.type === 'left') {
                hasLeftHand = true;
                this.frameBuffer.push(frame);
            }
        }
        if ((!hasLeftHand && (this.frameBuffer.length > this.minFrames)) || (this.frameBuffer.length >= this.maxFrames)) {
            let oldFrameBuffer = this.frameBuffer;
            this.frameBuffer = [];
            return { success: true, frames: oldFrameBuffer };
        } else if (!hasLeftHand) {
            this.frameBuffer = [];
        }
        return { success: false, frames: [] };
    }
}

module.exports = {
    Segmenter
};