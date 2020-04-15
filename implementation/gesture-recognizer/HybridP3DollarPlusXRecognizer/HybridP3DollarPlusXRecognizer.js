const AbstractRecognizer = require('../../../framework/recognizer').AbstractRecognizer;
const P3DollarPlusXRecognizer = require('./P3DollarPlusXRecognizer').Recognizer;
const Point = require('./P3DollarPlusXRecognizer').Point;

class Recognizer extends AbstractRecognizer {

	constructor(templates = {}) {
		super();
        
        // Initialize recognizer for large scale movement
        this.largeScaleRecognizer = new P3DollarPlusXRecognizer();

        // Initialize recognizer for fine movements
        this.smallScaleRecognizer = new P3DollarPlusXRecognizer();

        // Load templates
		Object.keys(templates).forEach((name) => {
			templates[name].forEach((template) => {
				this.addGesture(name, template.data);
			});
		});
	}

	addGesture(name, frames){
        const { scale, gestureData } = parseData(frames);

        // Add gesture
        if (scale === "small") {
            this.smallScaleRecognizer.addGesture(name, gestureData);
        } else if (scale === "large") {
            this.largeScaleRecognizer.addGesture(name, gestureData);
        } else {
            console.log("static gesture ?");
        }
    }

    recognize(frames){
        const { scale, gestureData } = parseData(frames);

        if (scale === "small") {
            return this.smallScaleRecognizer.recognize(gestureData);
        } else if (scale === "large") {
            return this.largeScaleRecognizer.recognize(gestureData);
        } else {
            //console.log("static gesture ?")
            return { success: false, name: "", time: 0.0 };
        }
	}
}

function parseData(frames) {
    const palmThreshold = 38;
    const fingerThreshold = 10;

    let largeScaleGestureData = [];
    let smallScaleGestureData = [];

    let maxPalmTranslation = 0;
    let maxFingerTranslation = 0;
    let palmInit = "";
    let fingerInit = {};
    let fingersData = {};

    let handId = -1;
    let palm = "";
    for (const frame of frames) {
        // Palm movement
        for (const hand of frame.hands) {
            if (hand.type === "right") {
                handId = hand.id;
                let palmPosition = hand['palmPosition']
                let x = palmPosition[0];
                let y = palmPosition[1];
                let z = palmPosition[2];
                palm = new Point(x, y, z, 0);
                largeScaleGestureData.push(palm);

                if (palmInit) {
                    let palmTranslation = distance(palmInit, palm);
                    maxPalmTranslation = Math.max(palmTranslation, maxPalmTranslation);
                } else {
                    palmInit = palm;
                }
            }
        }

        // Finger movement
        for (const pointable of frame['pointables']) {
            if (!pointable.tool && pointable.handId == handId) {
                let tipPosition = pointable['tipPosition'];
                if (pointable.type == 0 || pointable.type == 1) {   // Index or thumb
                    let x = tipPosition[0] - palm.x;
                    let y = tipPosition[1] - palm.y;
                    let z = tipPosition[2] - palm.z;
                    finger = new Point(x, y, z, pointable.type);

                    if (fingersData.hasOwnProperty(pointable.type)) {
                        let fingerTranslation = distance(fingersData[pointable.type][0], finger);
                        maxFingerTranslation = Math.max(fingerTranslation, maxFingerTranslation);
                        fingersData[pointable.type].push(finger);
                    } else {
                        fingersData[pointable.type] = [finger];
                    }
                }                    
            }
        }
    }

    //console.log(`Palm: ${maxPalmTranslation} | Finger: ${maxFingerTranslation}`);

    if (maxPalmTranslation > maxFingerTranslation * 1.2 && maxPalmTranslation > palmThreshold) {
        return { scale: "large", gestureData: largeScaleGestureData };
    } else if (maxFingerTranslation > fingerThreshold) {
        Object.keys(fingersData).forEach((finger) => {
			smallScaleGestureData = smallScaleGestureData.concat(fingersData[finger]);
		});
        return { scale: "small", gestureData: smallScaleGestureData };
    } else {
        return { scale: "", gestureData: [] };
    }
}

function distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = {
    Recognizer
}