import { w3cwebsocket as W3CWebSocket } from "websocket"; // Added
import EventEmitter from 'events'; 

// const template = {
//     "interactionBox": "{{interactionBox}}",
//     "timestamp": "{{timestamp}}",
//     "pointables": {
//         "{{#each pointables}}": {
//             "type": "{{type}}",
//             "stabilizedTipPosition": "{{stabilizedTipPosition}}",
//             "normalizedStabilizedTipPosition": "{{normalizedStabilizedTipPosition}}",
//             "tipVelocity": "{{tipVelocity}}",
//             "touchDistance": "{{touchDistance}}"
//         }
//     }
// }

class GestureHandler {
    
    constructor() {
        this.frameHandler = (frame) => {};

        this.eventEmitter = new EventEmitter();

        this.client = new W3CWebSocket('ws://127.0.0.1:6442'); // Added

        this.client.onopen = function() {
            console.log('WebSocket Client Connected');
            //client.send(JSON.stringify({'configuration': { 'dataTemplate': template }}));
        };

        this.client.onmessage = function(event) {
            let data = JSON.parse(event.data);
            console.log(data);
            if (data.hasOwnProperty('gesture')) {
                console.log(data.gesture)
                this.eventEmitter.emit(data.gesture);
            } else if (data.hasOwnProperty('frame')) {
                this.frameHandler(data.frame);
            }
        }.bind(this);
    }

    onFrame(handler) {
        this.frameHandler = handler;
    }

    onGesture(gesture, handler) {
        this.eventEmitter.on(gesture, handler);
    }

    removeGestureHandler(gesture, handler) {
        this.eventEmitter.removeListener(gesture, handler)
    }

    disconnect() {
        this.client.close();
    }
}

export default GestureHandler