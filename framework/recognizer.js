class AbstractRecognizer {

    constructor(name) {
        this.name = name;
    }

    addGesture(template) {
        throw new Error('You have to implement this function');
    }

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