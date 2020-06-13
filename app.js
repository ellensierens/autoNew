var socket = require('socket.io-client')('https://evening-caverns-60077.herokuapp.com/');
const { Board, Servo, Motors, GPS } = require("johnny-five");
let servo;
let motors;
// let gps;
const invertPWM = true;

const scale = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};


const board = new Board({
  repl: false,
});

board.on("ready", function () {
  servo = new Servo(7);
  // led.strobe(1000); // on off every second
  servo.to(90);

  motors = new Motors([
    { pins: { dir: 5, pwm: 6 }, invertPWM },
    { pins: { dir: 12, pwm: 11 }, invertPWM },
  ]);

  // gps = new GPS({
  //   pins: {
  //     rx: 11,
  //     tx: 10,
  //   }
  // });

    // If latitude, longitude change log it
    // gps.on("change", position => {
    //   const {altitude, latitude, longitude} = position;
    //   console.log("GPS Position:");
    //   console.log("  latitude   : ", position.latitude);
    //   console.log("  longitude  : ", position.longitude);
    //   console.log("  altitude   : ", position.altitude);
    //   console.log("--------------------------------------");
    // });

  console.log("ready");
});

socket.on("stop", (data) => {
  // console.log(data);
  motors.forward(0);
  servo.to(90);
});

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
