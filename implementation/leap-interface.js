const AbstractSensorIF = require('../framework/sensor-interface').AbstractSensorIF
const Leap = require('leapjs');

class SensorIF extends AbstractSensorIF {

    constructor() {
        super("Leap-Interface");
        this.callback = (frame) => {};
        this.controller = Leap.loop(function (frame) {
            this.callback(frame);
        }.bind(this));
    }

    // TODO add options ?
    loop(callback) {
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