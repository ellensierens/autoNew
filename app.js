var socket = require("socket.io-client")(
  "https://evening-caverns-60077.herokuapp.com/"
);
const { Board, Servo, Motors, GPS } = require("johnny-five");
let servo;
let motors;
const invertPWM = true;
let currentPosition = 90;
let step = 0.2;
let interval;
let intervalDelay = 50;

const scale = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const board = new Board({
  repl: false,
});

board.on("ready", function () {
  servo = new Servo(3);
  // led.strobe(1000); // on off every second
  servo.to(90);

  servoCamera = new Servo(9);
  servoCamera.to(90);

  motors = new Motors([
    { pins: { dir: 5, pwm: 6 }, invertPWM },
    { pins: { dir: 12, pwm: 11 }, invertPWM },
  ]);

  const gps = new GPS({
    port: board.io.SERIAL_PORT_IDs.HW_SERIAL1,
  });

  // If latitude, longitude, course or speed change log it
  gps.on("change", (position) => {
    const { latitude, longitude } = position;
    console.log("GPS Position:");
    console.log("  latitude   : ", latitude);
    console.log("  longitude  : ", longitude);
    console.log("--------------------------------------");

    socket.emit("coords", position);
  });

  // // If latitude, longitude change log it
  //  gps.on("change", position => {
  //   const {altitude, latitude, longitude} = position;
  //   console.log("GPS Position:");
  //   console.log("  latitude   : ", position.latitude);
  //   console.log("  longitude  : ", position.longitude);
  //   console.log("  altitude   : ", position.altitude);
  //   console.log("--------------------------------------");
  // });
  console.log(gps.latitude);

  console.log("ready");
});

socket.on("stop", (data) => {
  clearInterval(interval);
  // console.log(data);
  motors.forward(0);
  servo.to(90);
});

socket.on("cameraControls", (data) => {
  clearInterval(interval);
  // console.log("camera controls");
  console.log(data);

  // const scaledCamera = scale(data.x, -50, 50, 140, 40);

  console.log(currentPosition);
  // console.log(scaledCamera);
  // console.log(servoCamera.position - scaledCamera);
  // const moved = servoCamera.position - scaledCamera;
  if (between(currentPosition, 0, 180)) {
    if (between(parseFloat(data.x), 0, 10)) {
      console.log(`+1`);
      currentPosition += step;
      interval = setInterval(() => {
        currentPosition += step;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), 11, 20)) {
      console.log(`+2`);
      currentPosition += step * 2;
      interval = setInterval(() => {
        currentPosition += step * 2;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), 21, 30)) {
      console.log(`+3`);
      currentPosition += step * 3;
      interval = setInterval(() => {
        currentPosition += step * 3;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), 31, 40)) {
      console.log(`+4`);
      currentPosition += step * 4;
      interval = setInterval(() => {
        currentPosition += step * 4;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), 41, 50)) {
      console.log(`+5`);
      currentPosition += step * 5;
      interval = setInterval(() => {
        currentPosition += step * 5;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), -10, 0)) {
      console.log(`-1`);
      currentPosition -= step * 1;
      interval = setInterval(() => {
        currentPosition -= step;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), -20, -11)) {
      console.log(`-2`);
      currentPosition -= step * 2;
      interval = setInterval(() => {
        currentPosition -= step * 2;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), -30, -21)) {
      console.log(`-3`);
      currentPosition -= step * 3;
      interval = setInterval(() => {
        currentPosition -= step * 3;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), -40, -31)) {
      console.log(`-4`);
      currentPosition -= step * 4;
      interval = setInterval(() => {
        currentPosition -= step * 4;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    } else if (between(parseFloat(data.x), -50, -41)) {
      console.log(`-5`);
      currentPosition -= step * 5;
      interval = setInterval(() => {
        currentPosition -= step * 5;
        console.log(`in interval`);
        servoCamera.to(currentPosition);
      }, intervalDelay);
    }
  }

  if (currentPosition > 180) {
    currentPosition = 180;
  }

  if (currentPosition < 0) {
    currentPosition = 0;
  }

  servoCamera.to(currentPosition);

  // servoCamera.to(scaledCamera, Math.abs(moved), Math.abs(moved));
  // servoCamera.to(scaledCamera, 500);

  // if(moved > 0) {
  //   for(i = 0; i< Math.round(moved); i++ ) {
  //     servoCamera.to(servoCamera.position + 1);
  //   }
  // }
});

const between = (x, min, max) => {
  return x >= min && x <= max;
};

socket.on("carControls", (data) => {
  // console.log(data);

  if (data.x > 25) {
    servo.to(102);
  } else if (data.x < -25) {
    servo.to(78);
  } else {
    const scaledX = scale(data.x, -25, 25, 78, 102);
    console.log(scaledX);
    servo.to(scaledX);
  }

  if (data.y < 0) {
    if (data.x < -25) {
      motors.forward(255);
    } else {
      // console.log(`value: ${data.y}`);
      const scaledY = scale(data.y, -25, 0, 255, 0);
      motors.forward(scaledY);
      // console.log(scaledY);
    }
  }

  if (data.y > 0) {
    if (data.x > 25) {
      motors.reverse(255);
    } else {
      // console.log(`value: ${data.y}`);
      const scaledY = scale(data.y, 0, 25, 0, 255);
      motors.reverse(scaledY);
      // console.log(scaledY);
    }
    // console.log(`value: ${data.y}`);
    const scaledY = scale(data.y, 0, 50, 0, 255);
    motors.reverse(scaledY);
    // console.log(scaledY);
  }
});
