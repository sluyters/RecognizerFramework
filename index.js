const Recognizer = require('./implementation/programmatic-recognizer').Recognizer;
const SensorIF = require('./implementation/leap-interface').SensorIF;
const DataLoader = require('./implementation/leap-dataloader');
//const DataParser = require('./implementation/leap-dataparser');
const WebSocket = require('ws');
const http = require('http');

// Port and ip of the websocket server
const APP_INTERFACE_IP = '127.0.0.1';
const APP_INTERFACE_PORT = 6442;

// Load the training set and feed it to the recognizer
var trainingSet = DataLoader.load();
var recognizer = new Recognizer(trainingSet);

var sensorIF = new SensorIF();

var wsServer = getWebSocketServer(APP_INTERFACE_IP, APP_INTERFACE_PORT);
var x = 0;
wsServer.on('connection', function connection(ws) {
    console.log("Connected!");

    // Set callback
    ws.on('message', function incoming(message) {
        var data = JSON.parse(message.utf8Data);
        if (data.hasOwnProperty('context')) {
            // TODO
        }
    });

    var hadRightHand = false;
    var send = true;
    // Process sensor frames
    sensorIF.loop((frame) => {
        if (true) {
            for (const hand of frame.hands) {
                var hasRightHand = false
                if (hand.type === "right") {
                    hasRightHand = true;
                    hadRightHand = true;
                    var fingers = [];
                    hand.fingers.forEach((pointable) => {
                        const position = pointable.stabilizedTipPosition;
                        const normalized = frame.interactionBox.normalizePoint(position);
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
        }
        send = !send;

        var { success, name, time } = recognizer.recognize(frame);
        if (success) {
            console.log(name);
            ws.send(JSON.stringify({ 'gesture': name }));
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
