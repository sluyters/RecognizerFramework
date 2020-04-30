const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../framework/gestures/GestureSet').GestureSet;
const GestureClass = require('../../../framework/gestures/GestureClass').GestureClass;

function loadDataset() {
    let gestureSet = new GestureSet("GuinevereUnified");
    let dirPath = __dirname;
    let gestureIndex = 0;
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach((user) => {
        if (user.isDirectory()) {
            let userDirPath = path.join(dirPath, user.name);
            fs.readdirSync(userDirPath).forEach((gesture) => {
                let rawGesturePath = path.join(userDirPath, gesture);
                let strokeData = JSON.parse(fs.readFileSync(rawGesturePath));
                gesture = gesture.split(".")[0].split("-");
                let gestureName = gesture[0].split("#")[0];
                if(gestureSet.getGestureClasses().has(gestureName)){
                    gestureSet.getGestureClasses().get(gestureName).addSample(strokeData);
                }
                else{
                    let gestureClass = new GestureClass(gestureName, gestureIndex);
                    gestureIndex+=1;
                    gestureClass.addSample(strokeData);
                    gestureSet.addGestureClass(gestureClass);
                }
            });
        }
    });
    
    return gestureSet;
}

module.exports = {
    loadDataset
};