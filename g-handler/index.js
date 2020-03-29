import { w3cwebsocket as W3CWebSocket } from "websocket"; // Added

class GestureHandler {
    
    constructor() {
        this.eventEmitter = new EventEmitter();

        this.client = new W3CWebSocket('ws://localhost:6442'); // Added

        this.client.onopen = function() {
            console.log('WebSocket Client Connected');
            //client.send(JSON.stringify({'configuration': { 'dataTemplate': template }}));
        };

        this.client.onmessage = function(event) {
            let data = JSON.parse(event.data);
            if (data.hasOwnProperty('gesture')) {
                this.eventEmitter.emit('all');
                this.eventEmitter.emit(data.gesture);
            }
        }
    }

    onGesture(gesture, handler) {
        this.eventEmitter.on(gesture, handler);
    }

    removeGestureHandler(gesture, handler) {
        this.eventEmitter.removeListener(gesture, handler)
    }
}

module.exports = {
    GestureHandler
};