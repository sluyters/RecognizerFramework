const WebSocket = require('ws');
const http = require('http');
const config = require('./config');
const FrameProcessor = require('./framework/frame-processor').FrameProcessor;

// Load the modules
const SensorIF = config.sensorIF.module;

// Main function
function run() {
    // Initialize the sensor interface, dataset, recognizer and segmenter
    var sensorIF = new SensorIF(config.sensorIF.options);
    var frameProcessor = new FrameProcessor(config);

    // Start the websocket server
    var wsServer = getWebSocketServer(config.server.ip, config.server.port);
    wsServer.on('connection', async function connection(ws) {
        frameProcessor.resetContext();
        // Handle messages from the client
        ws.on('message', function(message) {
            var data = JSON.parse(message);
            if (data.hasOwnProperty('addPose')) {
                let poseName = data.addPose;
                frameProcessor.enablePose(poseName);
            } else if (data.hasOwnProperty('addGesture')) {
                let gestureName = data.addGesture;
                frameProcessor.enableGesture(gestureName);
            } else if (data.hasOwnProperty('removePose')) {
                let poseName = data.removePose;
                frameProcessor.disablePose(poseName);
            } else if (data.hasOwnProperty('removeGesture')) {
                let gestureName = data.removeGesture;
                frameProcessor.disableGesture(gestureName);
            }
        });

        // Process sensor frames
        sensorIF.loop((frame, appData) => {
            let message = {};

            if (appData) {
                // If there is data to send to the application
                message.frame = appData;
            }

            // Gesture recognition
            var ret = frameProcessor.processFrame(frame);
            if (ret) {
                // If there gesture data to send to the application
                message.gesture = ret;
            }

            if (Object.entries(message).length != 0 && message.constructor === Object) {
                // If the message is not empty, send it to the application
                ws.send(JSON.stringify(message));
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
}

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

if (require.main === module) {
    run();
}