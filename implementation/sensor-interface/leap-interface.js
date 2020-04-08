const AbstractSensorIF = require('../../framework/sensor-interface').AbstractSensorIF
const Leap = require('leapjs');

class SensorIF extends AbstractSensorIF {

    constructor() {
        super("Leap-Interface");
        this.callback = (frame, appData) => {};
        this.controller = Leap.loop(function (frame) {
            // let appData = {};
            // for (const hand of frame.hands) {
            //     var fingers = [];
            //     hand.fingers.forEach((pointable) => {
            //         const position = pointable.stabilizedTipPosition;
            //         const normalized = frame.interactionBox.normalizePoint(position);
            //         fingers.push({ 
            //             'type': pointable.type, 
            //             'normalizedPosition': normalized, 
            //             'touchDistance': pointable.touchDistance, 
            //             'tipVelocity': pointable.tipVelocity 
            //         });
            //     });
            //     if (hand.type === "right") {
            //         appData['rightHand'] = fingers;
            //     } else {
            //         appData['leftHand'] = fingers;
            //     }
            // }
            // this.callback(frame, appData);
            this.callback(frame);
        }.bind(this));
    }

    loop(callback, options = {}) {
        this.controller.connect()
        this.callback = callback;
    }

    stop() {
        this.controller.disconnect();
    }

}

module.exports = {
    SensorIF
}