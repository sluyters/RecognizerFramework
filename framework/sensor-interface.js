class AbstractSensorIF {

    constructor(name) {
        this.name = name;
    }

    loop(options, callback) {
        throw new Error('You have to implement this function');
    }

    stop() {
        throw new Error('You have to implement this function');
    }

}

module.exports = {
    AbstractSensorIF
}