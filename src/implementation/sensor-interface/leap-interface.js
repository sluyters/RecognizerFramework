const AbstractSensorIF = require('../../framework/sensor-interface').AbstractSensorIF
const Point = require('../../framework/gestures/Point').Point3D;
const Leap = require('leapjs');

const palms = ["rightPalmPosition", "leftPalmPosition"];
const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];

class SensorIF extends AbstractSensorIF {

    constructor(options) {
        super("Leap-Interface");
        this.framerate = options.framerate;
        this.controller = new Leap.Controller({
            frameEventName: 'deviceFrame',
            loopWhileDisconnected: false
        })
        this.sensorLoop = null;
    }

    loop(callback) {
        this.controller.connect()
        this.callback = callback;

        let hadRightHand = false;

        let processLeapFrame = function () {
            let frame = this.controller.frame();
            let parsedFrame = initFrame(frame.timestamp);
            let appData = null;
            let fingers = [];
            // Palm positions
            for (const hand of frame.hands) {
                let palmName;
                if (hand.type === 'right') {
                    palmName = "rightPalmPosition";
                    parsedFrame.hasRightHand = true;
                }
                else {
                    palmName = "leftPalmPosition";
                    parsedFrame.hasLeftHand = true;
                }
                let palmPosition = hand.palmPosition;
                parsedFrame.articulations[palmName] = new Point(palmPosition[0], palmPosition[1], palmPosition[2], frame.timestamp);         
                hand.fingers.forEach((finger) => {
                    if (hand.type === 'right') {
                        // Get data usable by the application
                        let position = finger.stabilizedTipPosition;
                        let normalized = frame.interactionBox.normalizePoint(position);
                        fingers.push({ 
                            'type': finger.type, 
                            'normalizedPosition': normalized, 
                            'touchDistance': finger.touchDistance, 
                            'tipVelocity': finger.tipVelocity 
                        });
                    }
                    let fingerName = getFingerName(hand.type === 'right', finger.type);
                    let tipPosition = finger.tipPosition;   
                    parsedFrame.articulations[fingerName] = new Point(tipPosition[0], tipPosition[1], tipPosition[2], frame.timestamp);
                });
            }

            if (fingers.length == 0 && hadRightHand) {
                // If the hand is not visible anymore, send empty data once
                hadRightHand = false;
            } else {
                appData = { 'fingers': fingers };
            }

            callback(parsedFrame, appData);
        }.bind(this);

        this.sensorLoop = setInterval(processLeapFrame, 1000/this.framerate);
    }

    stop() {
        if (this.sensorLoop !== null) {
            clearInterval(this.sensorLoop);
            this.controller.disconnect();
            this.sensorLoop = null;
        }
    }
}

function initFrame(timestamp) {
    let frame = { 
        'timestamp': timestamp, 
        'hasLeftHand': false, 
        'hasRightHand': false,
        'articulations': {}
    };
    for (const palm of palms) {
        frame.articulations[palm] = new Point(0, 0, 0, timestamp);
    }
    for (const finger of fingers) {
        frame.articulations[finger] = new Point(0, 0, 0, timestamp);
    }
    return frame
}

function getFingerName(isRight, type) {
    if (isRight) {
        return fingers[type];
    } else {
        return fingers[5 + type];
    }
}

module.exports = {
    SensorIF
}