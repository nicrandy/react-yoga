import React from "react";
import { useEffect } from "react";
import { useTimeout } from "usehooks-ts";
import { useRef, useState } from "react";
import "../css/landmarkLines.css";

export const DrawLines = (props) => {
  const canvasRef = useRef();
  const contextRef = useRef();
  // for confirmation circles
  const [handsInCircles, setHandsInCircles] = useState(false);
  const [startConfirmation, setStartConfirmation] = useState(false);
  const [completeConfirmation, setCompleteConfirmation] = useState(false);
  const [handsEnteredTime, setHandsEnteredTime] = useState(0);
  const [canUseConfirmSquares, setCanUseConfirmSquares] = useState(true);
  // for breathing
  const [breathingExerciseInProgress, setBreathingExercise] = useState(false);
  const [currentBreathingCircleCount, setBreathingCircleCount] = useState(1); // track current number of circles
  const [breathingIn, setBreathingIn] = useState(true); // track if breathing in or out

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // draw the webcam image on the canvas
  if (props.landmarks !== undefined) {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    //set canvas size
    canvasElement.width = props.width;
    canvasElement.height = props.height;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();
    drawLandmarkLines(canvasRef.current, canvasCtx, props.landmarks);
    drawBoundingBox(canvasRef.current, canvasCtx, props.boundingBox);
    drawConfirmationCircles(canvasRef.current, canvasCtx, props.landmarks);
    breathingExercise(canvasRef.current, canvasCtx, props.landmarks);
  }
  useEffect(() => {
    if (breathingIn) {
      setBreathingCircleCount(currentBreathingCircleCount + 1);
    } else {
      setBreathingCircleCount(currentBreathingCircleCount - 1);
    }
    if (currentBreathingCircleCount >= 3) {
      setBreathingIn(false);
    }
    if (currentBreathingCircleCount <= 1) {
      setBreathingIn(true);
    }
  }, [seconds]);

  function breathingExercise(canvas, canvasCtx, landmarks) {
    const userCanvas = canvas;
    const userContext = canvasCtx;
    let currentLandmarksArray = convertLandmarkObjectToArray(landmarks);
    let centerX = parseInt(
      ((currentLandmarksArray[11][0] - currentLandmarksArray[12][0]) / 2 +
        currentLandmarksArray[12][0]) *
        userCanvas.width
    );
    let centerY = parseInt(
      ((currentLandmarksArray[23][1] - currentLandmarksArray[11][1]) / 2 +
        currentLandmarksArray[11][1]) *
        userCanvas.height
    );
    let circleOutlineColor = "rgba(0,0,250," + 1 + ")";
    if (breathingIn) {
      circleOutlineColor = "blue";

      for (let i = 1; i <= currentBreathingCircleCount; i++) {
        let diameter = 40 * i;
        userContext.linewidth = 10;
        userContext.fillStyle = "rgba(0,255,0," + 0 + ")";
        userContext.strokeStyle = circleOutlineColor;
        userContext.beginPath();
        userContext.arc(centerX, centerY, diameter, 0, 2 * Math.PI);
        userContext.closePath();
        userContext.fill();
        userContext.stroke();
      }
    } else {
      circleOutlineColor = "purple";

      for (let i = currentBreathingCircleCount; i >= 1; i--) {
        let diameter = 40 * i;
        userContext.linewidth = 10;
        userContext.fillStyle = "rgba(50,200,50," + 0 + ")";
        userContext.strokeStyle = circleOutlineColor;
        userContext.beginPath();
        userContext.arc(centerX, centerY, diameter, 0, 2 * Math.PI);
        userContext.closePath();
        userContext.fill();
        userContext.stroke();
      }
    }

    // setInterval(() => {
    //   if (breathingIn) {
    //     setBreathingCircleCount(currentBreathingCircleCount + 1);
    //   } else {
    //     setBreathingCircleCount(currentBreathingCircleCount - 1);
    //   }
    //   if (currentBreathingCircleCount >= 3) {
    //     setBreathingIn(false);
    //   }
    //   if (currentBreathingCircleCount <= 1) {
    //     setBreathingIn(true);
    //   }
    // }, 1000);
  }

  function convertLandmarkObjectToArray(landmarks) {
    let landmarkArray = [];
    for (let i = 0; i < landmarks.length; i++) {
      landmarkArray.push([
        landmarks[i].x,
        landmarks[i].y,
        landmarks[i].z,
        landmarks[i].visibility,
      ]);
    }
    return landmarkArray;
  }
  // draw lines between landmarks and circles on landmark locations
  function drawLandmarkLines(canvas, context, landmarksoBJ) {
    let landmarks = convertLandmarkObjectToArray(landmarksoBJ);
    const userCanvas = canvas;
    const userContext = context;
    // connections to draw based on Blazepose model card
    let connections = [
      [11, 13],
      [13, 15],
      [15, 19],
      [12, 14],
      [14, 16],
      [16, 20],
      [12, 11],
      [12, 24],
      [11, 23],
      [23, 24],
      [23, 25],
      [24, 26],
      [26, 28],
      [25, 27],
      [27, 31],
      [28, 32],
    ];
    connections.forEach(function (item, index) {
      let xStart = Math.round(landmarks[item[0]][0] * userCanvas.width);
      let yStart = Math.round(landmarks[item[0]][1] * userCanvas.height);
      let yFinish = Math.round(landmarks[item[1]][1] * userCanvas.height);
      let xFinish = Math.round(landmarks[item[1]][0] * userCanvas.width);
      userContext.beginPath();
      userContext.moveTo(xStart, yStart);

      if (
        (item[0] == 12 && item[1] == 11) ||
        (item[0] == 23 && item[1] == 24)
      ) {
        // between shoulders and hips
        userContext.strokeStyle = "rgba(45,0,249,0.5)";
      } else if (item[0] % 2 == 0) {
        // right side of body
        userContext.strokeStyle = "rgba(242,29,29,0.5)";
      } else {
        // left side of body
        userContext.strokeStyle = "rgba(0,236,61,0.5)";
      }
      userContext.lineWidth = 10;
      userContext.lineCap = "round";
      userContext.lineTo(xFinish, yFinish);
      userContext.stroke();

      userContext.beginPath();
      userContext.moveTo(xStart, yStart);

      if (
        (item[0] == 12 && item[1] == 11) ||
        (item[0] == 23 && item[1] == 24)
      ) {
        userContext.strokeStyle = "rgba(0,237,249,0.8)";
      } else if (item[0] % 2 == 0) {
        userContext.strokeStyle = "rgba(255,20,251,0.8)";
      } else {
        userContext.strokeStyle = "rgba(57,236,0,0.8)";
      }
      userContext.lineWidth = 2;
      userContext.lineCap = "round";
      userContext.lineTo(xFinish, yFinish);
      userContext.stroke();
    });
  }

  function drawBoundingBox(canvas, context, boundingBox) {
    const userCanvas = canvas;
    const userContext = context;
    // draw lines around bounding box
    userContext.beginPath();
    userContext.strokeStyle = "rgba(0,0,0,0.5)";
    userContext.lineWidth = 10;
    userContext.lineCap = "round";
    let xStart = Math.round(boundingBox.minX * userCanvas.width);
    let yStart = Math.round(boundingBox.minY * userCanvas.height);
    let x2 = Math.round(boundingBox.maxX * userCanvas.width);
    let y2 = Math.round(boundingBox.minY * userCanvas.height);
    let x3 = Math.round(boundingBox.maxX * userCanvas.width);
    let y3 = Math.round(boundingBox.maxY * userCanvas.height);
    let x4 = Math.round(boundingBox.minX * userCanvas.width);
    let y4 = Math.round(boundingBox.maxY * userCanvas.height);
    userContext.moveTo(xStart, yStart);
    userContext.lineTo(x2, y2);
    userContext.lineTo(x3, y3);
    userContext.lineTo(x4, y4);
    userContext.lineTo(xStart, yStart);
    userContext.stroke();
  }

  function drawConfirmationCircles(canvas, context, landmarks) {
    const userCanvas = canvas;
    const userContext = context;
    let currentLandmarksArray = convertLandmarkObjectToArray(landmarks);

    let circleDiameterRatio = 0.25;
    let currentTime = Date.now();
    let alphaValue = 0.05;
    if (handsInCircles) {
      alphaValue = (currentTime - handsEnteredTime) / 1000;
    }
    let circlFillColor = "rgba(0,255,50," + alphaValue + ")";

    if (!canUseConfirmSquares) {
      circlFillColor = "rgba(246,255,50," + alphaValue + ")";
    } else {
      circlFillColor = "rgba(0,255,50," + alphaValue + ")";
    }
    let nearHeadCircleDiameter = parseInt(
      Math.abs(currentLandmarksArray[11][0] - currentLandmarksArray[12][0]) *
        userCanvas.width *
        circleDiameterRatio
    );
    let leftX = parseInt(currentLandmarksArray[11][0] * userCanvas.width); // left shoulder
    let leftY = parseInt(currentLandmarksArray[3][1] * userCanvas.height); // left eye
    let rightX = parseInt(currentLandmarksArray[12][0] * userCanvas.width); // right shoulder
    let rightY = parseInt(currentLandmarksArray[6][1] * userCanvas.height); // right eye

    userContext.linewidth = 10;
    userContext.fillStyle = circlFillColor;
    userContext.strokeStyle = "rgb(0, 200, 0)";
    userContext.beginPath();
    userContext.arc(leftX, leftY, nearHeadCircleDiameter, 0, 2 * Math.PI);
    userContext.closePath();
    userContext.fill();
    userContext.stroke();
    userContext.fillStyle = circlFillColor;
    userContext.strokeStyle = "rgb(200, 0, 0)";
    userContext.beginPath();
    userContext.arc(rightX, rightY, nearHeadCircleDiameter, 0, 2 * Math.PI);
    userContext.closePath();
    userContext.fill();
    userContext.stroke();

    // Draw the circles for the center of hands
    // get the center of the users right and left hand, mid point between pinky and thumb
    let RightHandCenterX =
      (currentLandmarksArray[22][0] - currentLandmarksArray[18][0]) / 2 +
      currentLandmarksArray[18][0];
    let RightHandCenterY =
      (currentLandmarksArray[22][1] - currentLandmarksArray[18][1]) / 2 +
      currentLandmarksArray[18][1];
    let LeftHandCenterX =
      (currentLandmarksArray[21][0] - currentLandmarksArray[17][0]) / 2 +
      currentLandmarksArray[17][0];
    let LeftHandCenterY =
      (currentLandmarksArray[21][1] - currentLandmarksArray[17][1]) / 2 +
      currentLandmarksArray[17][1];
    const circleDiameter = 20;
    userContext.fillStyle = circlFillColor;
    userContext.strokeStyle = "green";
    userContext.beginPath();
    userContext.arc(
      LeftHandCenterX * userCanvas.width,
      LeftHandCenterY * userCanvas.height,
      circleDiameter,
      0,
      2 * Math.PI
    );
    userContext.closePath();
    userContext.fill();
    userContext.stroke();
    userContext.fillStyle = circlFillColor;
    userContext.strokeStyle = "red";
    userContext.beginPath();
    userContext.arc(
      RightHandCenterX * userCanvas.width,
      RightHandCenterY * userCanvas.height,
      circleDiameter,
      0,
      2 * Math.PI
    );
    userContext.closePath();
    userContext.fill();
    userContext.stroke();

    // check if the rightHandCenterX and LeftHandCenterX are within the nearHeadCircleDiameter area
    function confirmChoice() {
      if (!startConfirmation) {
        setHandsEnteredTime(Date.now());
        setStartConfirmation(true);
      }

      setTimeout(() => {
        if (!completeConfirmation) {
          setCompleteConfirmation(true);
        }
      }, "1000"); // hands must be in confirmation area for set amount of time
      if (completeConfirmation && startConfirmation) {
        if (canUseConfirmSquares) {
          setCanUseConfirmSquares(false);
          props.updateWithConfirmation();
        }
        setTimeout(() => {
          setCanUseConfirmSquares(true);
        }, "2000");
      }
    }
    if (canUseConfirmSquares) {
      let leftx = LeftHandCenterX;
      let lefty = LeftHandCenterY;
      let leftcircleX = currentLandmarksArray[11][0];
      let leftcircleY = currentLandmarksArray[3][1];
      let leftrad =
        Math.abs(currentLandmarksArray[11][0] - currentLandmarksArray[12][0]) *
        circleDiameterRatio;
      let rightx = RightHandCenterX;
      let righty = RightHandCenterY;
      let rightcircleX = currentLandmarksArray[12][0];
      let rightcircleY = currentLandmarksArray[6][1];
      let rightrad =
        Math.abs(currentLandmarksArray[11][0] - currentLandmarksArray[12][0]) *
        circleDiameterRatio;
      if (
        (leftx - leftcircleX) * (leftx - leftcircleX) +
          (lefty - leftcircleY) * (lefty - leftcircleY) <=
          leftrad * leftrad &&
        (rightx - rightcircleX) * (rightx - rightcircleX) +
          (righty - rightcircleY) * (righty - rightcircleY) <=
          rightrad * rightrad
      ) {
        if (!handsInCircles) {
          setHandsInCircles(true);
        }
        confirmChoice();
      } else {
        if (handsInCircles) {
          setHandsInCircles(false);
        }
        if (startConfirmation) {
          setStartConfirmation(false);
        }
        // startConfirmation = false;
        if (completeConfirmation) {
          setCompleteConfirmation(false);
        }
      }
    }
  }

  return <canvas id="landmarkLinesCanvas" ref={canvasRef} />;
};
