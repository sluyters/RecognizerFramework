const WebSocket = require('ws');
const http = require('http');
const config = require('./config');

// Load the modules
const Recognizer = config.recognizer.module;
const SensorIF = config.sensorIF.module;
const Dataset = config.dataset.module;
const GestureSegmenter = config.segmenter.module;

// Initialize the sensor interface, recognizer and segmenter
var sensorIF = new SensorIF(config.sensorIF.options);
var recognizer = new Recognizer(config.recognizer.options, Dataset.loadDataset());
var gestureSegmenter = new GestureSegmenter(config.segmenter.options);

// Start the websocket server
var wsServer = getWebSocketServer(config.server.ip, config.server.port);
wsServer.on('connection', async function connection(ws) {
    // Wait 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("Connected!");
    
    // Set callback
    ws.on('message', function incoming(message) {
        var data = JSON.parse(message.utf8Data);
        if (data.hasOwnProperty('context')) {
            // TODO
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
            if (success) {
                console.log(name);
                gestureSegmenter.notifyRecognition();
                ws.send(JSON.stringify({ 'gesture': name }));
            }
        }
    });

    ws.on('close', function() {
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
