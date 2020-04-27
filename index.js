const WebSocket = require('ws');
const http = require('http');
const config = require('./config');

// Load the modules
const Recognizer = config.recognizer.module;
const SensorIF = config.sensorIF.module;
const Dataset = config.dataset.module;
const GestureSegmenter = config.segmenter.module;

// Initialize the sensor interface, recognizer and segmenter
var dataset =  Dataset.loadDataset()
var sensorIF = new SensorIF(config.sensorIF.options);
if (config.general.loadGesturesFromClient) {
    // Train the recognizer with the gestures requested by the client
    var recognizer = new Recognizer(config.recognizer.options);
} else {
    // Train the recognizer with the whole dataset
    var recognizer = new Recognizer(config.recognizer.options, dataset);
}
var gestureSegmenter = new GestureSegmenter(config.segmenter.options);

// Start the websocket server
var wsServer = getWebSocketServer(config.server.ip, config.server.port);
wsServer.on('connection', async function connection(ws) {
    let requestedGestures = [];

    // Set callback
    ws.on('message', function(message) {
        var data = JSON.parse(message);
        if (data.hasOwnProperty('addGesture')) {
            // A new gesture needs to be recognized
            let gestureName = data.addGesture;
            if (!requestedGestures.includes(gestureName)) {
                // The gesture has not already been requested
                if (config.general.loadGesturesFromClient) {
                    // The gesture has to be added to the recognizer
                    let gestureClass = dataset.getGestureClass(gestureName);
                    if (gestureClass) {
                        for (template of gestureClass.getSample()) {
                            console.log(gestureName)
                            recognizer.addGesture(gestureName, template);
                        }
                    }
                }
                requestedGestures.push(gestureName);
            }
        } else if (data.hasOwnProperty('removeGesture')) {
            // A gesture does not need to be recognized anymore
            let gestureName = data.addGesture;
            var index = requestedGestures.indexOf(gestureName);
            if (index > -1) {
                // The gesture previously had to be recognized
                requestedGestures.splice(index, 1);
                if (config.general.loadGesturesFromClient) {
                    // The gesture has to be removed from the recognizer (if supported by the recognizer)
                    // TODO recognizer.removeGesture(gestureName);
                }
            }
        }
    });

    var hadRightHand = false;
    // Process sensor frames
    sensorIF.loop((parsedFrame, rawFrame) => {
        // TODO - move to another module
        // Send right hand fingers to the app 
        var hasRightHand = false;
        for (const hand of rawFrame.hands) {
            if (hand.type === "right") {
                hasRightHand = true;
                hadRightHand = true;
                var fingers = [];
                hand.fingers.forEach((pointable) => {
                    const position = pointable.stabilizedTipPosition;
                    const normalized = rawFrame.interactionBox.normalizePoint(position);
                    fingers.push({ 
                        'type': pointable.type, 
                        'normalizedPosition': normalized, 
                        'touchDistance': pointable.touchDistance, 
                        'tipVelocity': pointable.tipVelocity 
                    });
                });
                ws.send(JSON.stringify({ 'frame': { 'fingers': fingers } }))
            }
        }
        // If the hand is not visible anymore, send empty data once
        if (hadRightHand && !hasRightHand) {
            hadRightHand = false;
            ws.send(JSON.stringify({ 'frame': { 'fingers': [] } }))
        }

        // Gesture segmentation
        var { success, segment } = gestureSegmenter.segment(parsedFrame);
        if (success) {
            // Gesture recognition
            var { success, name, time } = recognizer.recognize(segment);
            if (success && requestedGestures.includes(name)) {
                console.log(name);
                gestureSegmenter.notifyRecognition();
                ws.send(JSON.stringify({ 'gesture': name }));
            }
        }
    });

    ws.on('close', function() {
        console.log("Disconnected!")
        sensorIF.stop();
    });

    ws.on('error', function(error) {
        sensorIF.stop();
    });
});

function getWebSocketServer(ip, port) {
    // Create an HTTP server 
    var server = http.createServer();
    server.listen(port, ip, function () {
        console.log("WebSocket server listening on port " + port);
    });

    // Create WebSocket server
    var wsServer = new WebSocket.Server({ server });

    return wsServer;
}
