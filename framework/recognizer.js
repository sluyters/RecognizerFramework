class AbstractRecognizer {

    constructor(templates) {
        // Empty
    }

    /**
     * Add a gesture to the training set of this recognizer.
     * @param {Object} template - The gesture to add.
     */
    addGesture(template) {
        throw new Error('You have to implement this function');
    }

    /**
     * Check whether the set of frames corresponds to a known gesture.
     * @param {Object} frames - A set of frames from the sensor.
     */
    recognize(frames) {
        throw new Error('You have to implement this function');
    }

}

module.exports = {
    AbstractRecognizer
};