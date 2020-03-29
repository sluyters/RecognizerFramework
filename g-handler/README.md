# g-handler
> Provides an interface to connect to a gesture recogniser and provide handlers for each kind of gesture.

## Usage
```js
import GestureHandler from 'g-handler';

const gestureHandler = new GestureHandler();

gestureHandler.onGesture("rhand-open", function () {
    console.log("Gesture detected: rhand-open");
    // Do something
});

gestureHandler.onGesture("rhand-close", function () {
    console.log("Gesture detected: rhand-close");
    // Do something
});

function foo() {
    // Do something
}

gestureHandler.onGesture("all", foo);

gestureHandler.removeGestureHandler("rhand-close", foo);
```

## Methods
### `onGesture(name, handler)`


### `removeGestureHandler(name, handler)`