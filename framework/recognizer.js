class AbstractRecognizer {

    constructor(name) {
        this.name = name;
    }

    /**
     * Add a gesture to the training set of this recognizer.
     * @param {Object} template - The gesture to add.
     */
    addGesture(template) {
        throw new Error('You have to implement this function');
    }

    /**
     * Check whether the frame (and earlier frames) correspond to a known gesture.
     * @param {Object} frame - A frame from the sensor.
     */
    recognize(frame) {
        throw new Error('You have to implement this function');
    }

    getName() {
        return this.name;
    }

}

module.exports = {
    AbstractRecognizer
};