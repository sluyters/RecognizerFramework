const config = require('./config');

class FrameProcessor {
    constructor(config) {
        this.classifier = new config.classifier.module(config.classifier.options);
        this.segmenter = new config.segmenter.module(config.segmenter.options);
        this.dataset = config.dataset.module;
        if (config.general.loadGesturesFromClient) {
            this.recognizer =  new config.recognizer.module(config.recognizer.options);
        } else {
            this.recognizer = new config.recognizer.module(config.recognizer.options, this.dataset);
        }
        this.enabledGestures = [];
    }

    enableGesture(name) {
        if (!enabledGestures.includes(name)) {
            // The gesture is not already enabled
            if (config.general.loadGesturesFromClient) {
                loadTemplates(gestureName, recognizer, dataset);
            }
            enabledGestures.push(gestureName);
        }
    }

    disableGesture(name) {
        var index = enabledGestures.indexOf(name);
        if (index > -1) {
            // The gesture was enabled, disable it
            enabledGestures.splice(index, 1);
            if (config.general.loadGesturesFromClient) {
                // TODO this.recognizer.removeGesture(name);
            }
        }
    }

    processFrame(frame) {
        let staticPose = this.classifier.classify(frame);
        if (staticPose && this.enabledGestures.includes(staticPose)) {
            // Static pose detected
            let data = this.staticAnalyzer.analyze(staticPose, frame);
            return { 'gesture': { 'type': 'static', 'name': staticPose, 'data': data } };
        } else {
            // Dynamic gesture detected
            let segment = this.segmenter.segment(isDynamic, frame);
            if (segment) {
                let { success, name, time } = this.recognizer.recognize(segment);
                if (success && enabledGestures.includes(name)) {
                    this.segmenter.notifyRecognition();
                    return { 'gesture': { 'type': 'dynamic', 'name': name, 'data': [] } };
                }
            }
        }
        // Nothing detected
        return {};
    }
}

module.exports = {
    FrameProcessor
}