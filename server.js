const WebSocketClient = require('websocket').client;
const WebSocketServer = require('websocket').server;
const http = require('http');
const Recogniser = require('./utils/recogniser').Recogniser;
//const FrameParser = require('./utils/frameparser').FrameParser;

// Port and ip of the websocket server
const webSocketsServerPort = 6442;
const ip = '127.0.0.1';

// Create an HTTP server 
const server = http.createServer(function (request, response) {
    // Empty
});

server.listen(webSocketsServerPort, ip, function () {
    console.log("WebSocket server listening on port " + webSocketsServerPort);
});

// Create WebSocket server
var wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function (request) {

    const recogniser = new Recogniser();
    //const frameParser = new FrameParser();
    var dataTemplate = "";

    // Accept request
    var wsConnection = request.accept(null, request.origin);

    wsConnection.on('message', function (message) {
        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);
            if (data.hasOwnProperty('context')) {
                context = data.context;
            }
            if (data.hasOwnProperty('configuration')) {
                //let enabledGestures = data.configuration.gestures;
                dataTemplate = data.configuration.dataTemplate;
                // recogniser.setGestures(enabledGestures);
            }
        }
    });
    
    const client = new WebSocketClient();

    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var data = JSON.parse(message.utf8Data);
                if (data.hasOwnProperty('currentFrameRate')) {
                    //let frame = frameParser.parse(data);
                    // If received a frame
                    [gestureDetected, gestureName] = recogniser.analyseFrame(data, "");
                    if (gestureDetected) {
                        console.log(JSON.stringify(gestureName));
                        wsConnection.sendUTF(JSON.stringify({ 'gesture': gestureName }));
                    }
                    //wsConnection.sendUTF(JSON.stringify({ 'trackingData': frameParser.getFrameData(frame, dataTemplate) }));
                }
            }
        });

        connection.send(JSON.stringify({ enableGestures: true })); // Enable gestures
        connection.send(JSON.stringify({ focused: true })); // Claim focus
    })

    client.connect('ws://localhost:6437/v6.json');
});


