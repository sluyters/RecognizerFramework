class StaticAnalyzer {
    constructor(config) {
        this.previousFrame = null;
    }

    analyze(frame) {
        // TODO improve values
        if (this.previousFrame === null) {
            // Initialize previous frame
            this.previousFrame = frame;
        }
        // Compute pinch, rotation, and translation wrt. previous frame. 
        let pinch = computePinch(this.previousFrame, frame);
        let rotation = computeRotation(this.previousFrame, frame);
        let translation = computeTranslation(this.previousFrame, frame);
        // Save the current frame for next call
        this.previousFrame = frame;
        return { 'rotation': rotation, 'pinch': pinch, 'translation': translation };
    }
}

function computePinch(fromFrame, toFrame) {
    let dFrom = getDistance(fromFrame.articulations.rightThumbPosition, fromFrame.articulations.rightIndexPosition);
    let dTo = getDistance(toFrame.articulations.rightThumbPosition, toFrame.articulations.rightIndexPosition);
    return (dTo / dFrom) - 1;
}

function computeRotation(fromFrame, toFrame) {
    let alphaFromFrame = getAngleFromXAxis(fromFrame.articulations.rightThumbPosition, fromFrame.articulations.rightIndexPosition);
    let alphaToFrame = getAngleFromXAxis(toFrame.articulations.rightThumbPosition, toFrame.articulations.rightIndexPosition);
    return alphaFromFrame - alphaToFrame;
}

function computeTranslation(fromFrame, toFrame) {
    let pFrom = fromFrame.articulations.rightPalmPosition;
    let pTo = toFrame.articulations.rightPalmPosition;
    let dx = pTo.x - pFrom.x;
    let dy = pTo.y - pFrom.y;
    let dz = pTo.z - pFrom.z;
    return [dx, dy, dz];
}

function getAngleFromXAxis(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getDistance(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = {
    StaticAnalyzer
}