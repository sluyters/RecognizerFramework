const AbstractRecognizer = require('../../../framework/recognizer').AbstractRecognizer;
const jackknife_blades = require('./jackknife').jackknife_blades;
const Jackknife = require('./jackknife_recognizer').Jackknife;
const Vector = require('./vector').Vector;
const Sample = require('./sample').Sample;

class Recognizer extends AbstractRecognizer {

    static name = "JackknifeRecognizer";

    constructor(N, dataset) {
		super();
        this.N = N;
        let blades = new jackknife_blades();
        blades.set_ip_defaults();
        this.jackknifeRecognizer = new Jackknife(blades)
		if (dataset !== undefined){
			dataset.getGestureClass().forEach((gesture, key, self) => {
				gesture.getSample().forEach(sample => {
						this.addGesture(gesture.name, sample, false);
					}
				);
            });
            this.jackknifeRecognizer.train(6, 2, 1.0);
        }
    }
    
    recognize(sample) {
        let jackknifeSample = convert(sample);
        let t0 = Date.now();
        let ret = this.jackknifeRecognizer.classify(jackknifeSample);
        let t1 = Date.now();
		return (ret == -1) ? { success: false, name: 'No match', time: t1-t0 } : { success: true, name: ret, time: t1-t0 };
	}

	addGesture(name, sample, train = false) {
        let jackknifeSample = convert(sample, name);
        this.jackknifeRecognizer.add_template(jackknifeSample);
        if (train) {
            this.jackknifeRecognizer.train(6, 2, 1.0);
        }
	}
}

function convert(sample, name) {
    let jackknifeSample;
    if (name) {
        jackknifeSample = new Sample(0, name);
    } else {
        jackknifeSample = new Sample();
    }

    sample.strokes.forEach((stroke) => {
        let trajectory = [];
        let labels = Object.keys(stroke.paths).sort();
        let nFrames = stroke.paths[labels[0]].points.length;
        for (let i = 0; i < nFrames; i++) {
            let vCoordinates = []; 
            for (const label of labels) {
                let point = stroke.paths[label].points[i]   
                vCoordinates.push(point.x);
                vCoordinates.push(point.y);
                vCoordinates.push(point.z);
            }
            trajectory.push(new Vector(vCoordinates));
        }    
        jackknifeSample.add_trajectory(trajectory);
    });
    return jackknifeSample;
}

module.exports = {
	Recognizer
};