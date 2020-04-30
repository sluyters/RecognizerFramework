class StrokeData {

    constructor() {
        this.strokes = [];
    }

    addStroke(stroke) {
        this.strokes.push(stroke);
    }


}

class Stroke {
    constructor() {
        this.paths = {};
    }

    addPath(label, path) {
        this.paths[label] = path;
    }
}

class Path {
    constructor(label) {
        this.label = label;
        this.points = [];
    }

    setPoints(points) {
        this.points = points;
    }

    addPoint(point) {
        this.points.push(point);
    }
}

module.exports = {
    StrokeData,
    Stroke,
    Path
};