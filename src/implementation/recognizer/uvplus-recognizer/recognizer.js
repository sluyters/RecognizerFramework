const AbstractRecognizer = require('../../../framework/recognizer').AbstractRecognizer;
const dollar = require('./uvplus/dollar');

class Recognizer extends AbstractRecognizer {

    static name = "UVPRecognizer";

    constructor(options, dataset) {
        super();
        this.N = options.samplingPoints;
        this.recognizer = null;
        if (dataset !== undefined) {
            dataset.getGestureClasses().forEach((gesture) => {
                gesture.getSample().forEach((sample) => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        if (this.recognizer === null) {
            let nArticulations = Object.keys(sample.strokes[0].paths).length; // - 6;
            this.recognizer =  new dollar.UVPRecognizer(nArticulations, this.N);
        }
        console.log(this.recognizer.storeTemplate(convert(sample), name));
    }

    recognize(sample){
        if (this.recognizer === null) {
            return { success: false, name: 'No match', time: 0 };
        }
        let ret = this.recognizer.recognize(convert(sample));
        console.log(ret)
        return (!ret[0]) ? { success: false, name: 'No match', time: ret[1] } : { success: true, name: ret[0], time: ret[1] };
    }
}

function convert(sample) { 
    let points = [];
    sample.strokes.forEach((stroke) => {
        let labels = Object.keys(stroke.paths).sort(); //.splice(6);
        for (const articulation of labels) {
            points.push(stroke.paths[articulation].points);
        }
    });
    return points;
}



module.exports = {
    Recognizer
};