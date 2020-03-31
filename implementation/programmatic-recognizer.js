const AbstractRecognizer = require('../framework/recognizer').AbstractRecognizer;
const THREE = require('three');

const pauseDuration = 250; // Duration of pause between 2 gestures [ms]
const duplicatePauseDuration = 650; // Duration of pause between 2 opposite gestures [ms]
const oppositeGestures = {
    'rhand-lswipe': ['rhand-rswipe'],
    'rhand-rswipe': ['rhand-lswipe'],
    'rhand-uswipe': ['rhand-dswipe'],
    'rhand-dswipe': ['rhand-uswipe'],
    'rhand-acrotate': ['rhand-crotate'],
    'rhand-crotate': ['rhand-acrotate'],
    'rhand-open': ['rhand-close'],
    'rhand-close': ['rhand-open'],
    'rindex-airtap': [],
}

class Recognizer extends AbstractRecognizer {

    constructor(trainingSet) {
        super("Programmatic Recognizer");

        this.frameCacheSize = 10;
        this.lastGesture = "";
        this.rightHand = "";
        this.rightIndexFinger = "";
        this.leftHand = "";
        this.pause = 0;
        this.previousFrames = getFrameCache(this.frameCacheSize);
        let date = new Date();
        this.previousTime = date.getTime();
    }

    addGesture(template) {
        throw new Error('You have to implement this function');
    }

    recognize(frame) {
        // Get necessary data from frame 
        this.rightHand = "";
        this.leftHand = "";
        for (const hand of frame.hands) {
            if (hand.type === 'left') {
                this.leftHand = hand;
            } else {
                this.rightHand = hand;
            }
        }
        frame.pointables.forEach((pointable) => {
            if (!pointable.tool && pointable.type == 1 && pointable.handId == this.rightHand.id) {
                this.rightIndexFinger = pointable;
            }
        });

        let frameData = {
            timestamp: frame.timestamp,
            rightHand: this.rightHand,
            leftHand: this.leftHand
        }
        // Fill frame cache
        this.previousFrames.push(frameData);
        if (this.previousFrames.length < this.frameCacheSize) {
            this.previousTime = getTimeStamp();
            return { success: false, name: "", time: 0.0 };
        }

        // Avoid detecting gestures twice
        if (this.pause > 0 || this.duplicatePause > 0) {
            let now = getTimeStamp();
            this.pause -= now - this.previousTime;
            this.duplicatePause -= now - this.previousTime;
            this.previousTime = getTimeStamp();
            return { success: false, name: "", time: 0.0 };
        }

        if (this.rightHand) {
            if (this.rightHand.palmVelocity[0] < -400) {
                return this.getGesture('rhand-lswipe');
            } else if (this.rightHand.palmVelocity[0] > 400) {
                return this.getGesture('rhand-rswipe');
            } else if (this.rightHand.palmVelocity[1] > 400) {
                return this.getGesture('rhand-uswipe');
            } else if (this.rightHand.palmVelocity[1] < -400) {
                return this.getGesture('rhand-dswipe');
            } else if (this.previousFrames[2].rightHand !== "") {
                //let previousRoll = computeEulerAngles(this.previousFrames[2].rightHand)[2];
                //let roll = computeEulerAngles(this.rightHand)[2];
                //let rotation = ((roll - previousRoll) * 180) / 3.14;
                if (this.previousFrames[2].rightHand.pinchStrength > 0.8 && this.rightHand.pinchStrength < 0.1) {
                    return this.getGesture('rhand-open');
                } else if (this.previousFrames[2].rightHand.pinchStrength < 0.1 && this.rightHand.pinchStrength > 0.8) {
                    return this.getGesture('rhand-close');
                }
                // } else if (rotation > 20) {
                //     return this.getGesture('rhand-crotate');
                // } else if (rotation < -20) {
                //     return this.getGesture('rhand-acrotate');
                // }
            }
            if (this.rightIndexFinger && this.rightIndexFinger.tipVelocity[2] < -610) {
                return this.getGesture('rindex-airtap');
            } 
        }
        this.previousTime = getTimeStamp();
        return { success: false, name: "", time: 0.0 };
    }

    getName() {
        return this.name;
    }

    // Helper method
    getGesture(gesture) {
        this.previousTime = getTimeStamp();

        // Avoid detecting gestures twice
        if (this.pause > 0) {
            return { success: false, name: "", time: 0.0 };
        }

        if (this.duplicatePause > 0 && this.lastGesture && oppositeGestures[this.lastGesture].includes(gesture)) {
            return { success: false, name: "", time: 0.0 };
        }

        this.pause = pauseDuration;
        this.duplicatePause = duplicatePauseDuration;
        this.lastGesture = gesture;
        return { success: true, name: gesture, time: 0.0 };
    }

}

// Helper functions
function computeEulerAngles(hand) {
    var r = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            if (i < 3) {
                r.push(hand.r[j][i]);
            } else {
                r.push(0);
            }
        }
        r.push(0);
    }
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.fromArray(r);
    var eulerAngles = new THREE.Euler();
    eulerAngles.setFromRotationMatrix(rotationMatrix);
    return eulerAngles.toArray();
}

function getTimeStamp() {
    let date = new Date();
    return date.getTime();
}

function getFrameCache(size) {
    var cache = new Array();

    cache.push = function () {
        if (this.length >= size) {
            this.shift();
        }
        return Array.prototype.push.apply(this, arguments);
    }

    return cache;
}

module.exports = {
    Recognizer
};