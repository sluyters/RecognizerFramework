const AbstractSensorIF = require('../../framework/sensor-interface').AbstractSensorIF
const Leap = require('leapjs');

class SensorIF extends AbstractSensorIF {

    constructor() {
        super("Leap-Interface");
        this.callback = (frame) => {};
        this.controller = Leap.loop(function (frame) {
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