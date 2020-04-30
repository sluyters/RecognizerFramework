class AbstractRecognizer {

    constructor(templates) {
        // Empty
    }

    /**
     * Add a gesture to the training set of this recognizer.
     * @param {Object} name - The name of the gesture to add.
     * @param {Object} template - The gesture to add.
     */
    addGesture(name, template) {
        throw new Error('You have to implement this function');
    }

    /**
     * Remove a gesture from the training set of this recognizer.
     * @param {Object} name - The name of the gesture to remove.
     */
    removeGesture(name) {
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