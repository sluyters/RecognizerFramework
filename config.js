// MODULES ----------------------------------------------------------------------------------------
// Sensor Interfaces
const LeapIF = require('./implementation/sensor-interface/leap-interface').SensorIF;

// Gesture Datasets
const GuinevereUnifiedDataset = require('./implementation/training-dataset/GuinevereUnified/Dataset');
const BasicDataset = require('./implementation/training-dataset/BasicDataset/Dataset');

// Gesture Segmenters
const WindowSegmenter = require('./implementation/gesture-segmenter/window-segmenter').Segmenter
const ZoningSegmenter = require('./implementation/gesture-segmenter/zoning-segmenter').Segmenter
const LeftHandSegmenter = require('./implementation/gesture-segmenter/lefthand-segmenter').Segmenter;
const FrameSegmenter = require('./implementation/gesture-segmenter/frame-segmenter').Segmenter;

// Gesture Recognizers
const ProgrammaticRecognizer = require('./implementation/gesture-recognizer/programmatic-recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./implementation/gesture-recognizer/P3DollarPlusXRecognizer').Recognizer;
const HybridP3DollarPlusXRecognizer = require('./implementation/gesture-recognizer/HybridP3DollarPlusXRecognizer/Recognizer').Recognizer
const JackknifeRecognizer = require('./implementation/gesture-recognizer/JackknifeRecognizer/Recognizer').Recognizer;
const UVPRecognizer = require('./implementation/gesture-recognizer/UVPRecognizer/Recognizer').Recognizer;

// CONFIG INIT ------------------------------------------------------------------------------------
var config = {};

config.general = {};
config.server = {};
config.sensorIF = {};
config.sensorIF.options = {};
config.dataset = {};
config.segmenter = {};
config.segmenter.options = {};
config.recognizer = {};
config.recognizer.options = {};

// CONFIGURATION ----------------------------------------------------------------------------------
// General Configuration
config.general.loadGesturesFromClient = false;       // Load gestures based on requests from the client

// Server
config.server.ip = '127.0.0.1';						// IP of the server (for app interface)
config.server.port = 6442;							// Port of the server (for app interface)

// Sensor Interface
config.sensorIF.module = LeapIF;
config.sensorIF.options.framerate = 60;				// Sensor framerate [seconds]

// Gesture Dataset
config.dataset.module = BasicDataset;

// Gesture Segmenter
config.segmenter.module = WindowSegmenter;
config.segmenter.options.minSegmentLength = 10;		// Minimum length of a segment (if applicable) [#frames]
config.segmenter.options.maxSegmentLength = 60;		// Maximum length of a segment (if applicable) [#frames]
config.segmenter.options.windowWidth = 20;			// Width of the window (if applicable) [#frames]
config.segmenter.options.intervalLength = 3;		// Length of the interval between 2 consecutive segments (if applicable) [#frames]
config.segmenter.options.pauseLength = 60;			// Length of the pause after a gesture has been detected (if applicable) [#frames]
config.segmenter.options.xBound = 120;				// 1/2 width of the zone (if applicable) [mm]
config.segmenter.options.zBound = 60;				// 1/2 depth of the zone (if applicable) [mm]

// Gesture Recognizer
config.recognizer.module = JackknifeRecognizer;
config.recognizer.options.samplingPoints = 16;		// Number of sampling points [#points]

module.exports = config;