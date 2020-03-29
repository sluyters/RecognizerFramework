const ST = require('stjs')

// template = {
//     "interactionBox": "{{interactionBox}}",
//     "timestamp": "{{timestamp}}",
//     "pointables": {
//         "{{#each pointables.filter((elem) => !elem.tool)}}": {
//                 "type": "{{type}}",
//                 "stabilizedTipPosition": "{{stabilizedTipPosition}}",
//                 //"normalizedStabilizedTipPosition": "{{normalizedStabilizedTipPosition}}",
//                 "tipVelocity": "{{tipVelocity}}",
//                 "touchDistance": "{{touchDistance}}"
//             }

//     }
// }

class FrameParser {

    constructor() {
        //this.parsedFrame = "";
    }

    parse(frame) {
        //this.parsedFrame = frame;
        // Compute other data (eg, roll)
        return frame;
    }

    getFrameData(frame, template) {
        if (template) {
            return ST.select(frame).transformWith(template).root();
        } else {
            return frame;
        }
    }
}

module.exports = {
    FrameParser
}