const fs = require('fs');
const path = require('path');

function load(dirPath) {
    let templates = {};
    fs.readdirSync(dirPath).forEach((gestureClass) => {
        let gestureClassPath = path.join(dirPath, gestureClass);
        templates[gestureClass] = [];
        fs.readdirSync(gestureClassPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassPath, file);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            templates[gestureClass].push(rawGestureData);
        });
    })
    return templates;
}

module.exports = {
    load
}