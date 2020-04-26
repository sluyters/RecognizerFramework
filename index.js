//const Recognizer = require('./implementation/gesture-recognizer/programmatic-recognizer').Recognizer;
//const Recognizer = require('./implementation/gesture-recognizer/P3DollarPlusXRecognizer').Recognizer;
//const Recognizer = require('./implementation/gesture-recognizer/HybridP3DollarPlusXRecognizer/HybridP3DollarPlusXRecognizer').Recognizer
//const Recognizer = require('./implementation/gesture-recognizer/JackknifeRecognizer/Recognizer').Recognizer;
const Recognizer = require('./implementation/gesture-recognizer/UVPRecognizer/Recognizer').Recognizer;
const SensorIF = require('./implementation/sensor-interface/leap-interface').SensorIF;
//const DataLoader = require('./implementation/leap-dataloader');
//const Dataset = require('./implementation/training-dataset/GuinevereUnified/Dataset');
const Dataset = require('./implementation/training-dataset/BasicDataset/Dataset');
//const GestureSegmenter = require('./implementation/gesture-segmenter/window-segmenter').Segmenter
const GestureSegmenter = require('./implementation/gesture-segmenter/zoning-segmenter').Segmenter
//const GestureSegmenter = require('./implementation/gesture-segmenter/lefthand-segmenter').Segmenter;
//const GestureSegmenter = require('./implementation/gesture-segmenter/frame-segmenter').Segmenter;
//const DataParser = require('./implementation/leap-dataparser');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

// Port and ip of the websocket server
const APP_INTERFACE_IP = '127.0.0.1';
const APP_INTERFACE_PORT = 6442;

// Other constants
const NUM_POINTS = 16;

// Load the training set and feed it to the recognizer
var trainingSet = Dataset.loadDataset();
var recognizer = new Recognizer(NUM_POINTS, trainingSet);
var gestureSegmenter = new GestureSegmenter();

var sensorIF = new SensorIF();

var wsServer = getWebSocketServer(APP_INTERFACE_IP, APP_INTERFACE_PORT);
wsServer.on('connection', async function connection(ws) {
    console.log("Connected!");

    await new Promise(resolve => setTimeout(resolve, 100));
    
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
        if (hadRightHand && !hasRightHand) {
            hadRightHand = false;
            ws.send(JSON.stringify({ 'frame': { 'fingers': [] } }))
        }

        var { success, segment } = gestureSegmenter.segment(parsedFrame);
        if (success) {
            console.log(success)
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
    
    

// Helpers
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
