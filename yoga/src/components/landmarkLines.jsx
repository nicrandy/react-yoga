import React from "react";
import { useRef } from "react";
import "../css/landmarkLines.css";

export const DrawLines = (props) => {
  const canvasRef = useRef();
  const contextRef = useRef();

  // draw the webcam image on the canvas
  if (props.landmarks !== undefined) {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    //set canvas size  
    canvasElement.width = props.width;
    canvasElement.height = props.height;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // canvasCtx.drawImage(
    //   props.image.image,
    //   0,
    //   0,
    //   canvasElement.width,
    //   canvasElement.height
    // );
    canvasCtx.restore();
    drawLandmarkLines(canvasRef.current, canvasCtx, props.landmarks);
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

  return <canvas id="landmarkLinesCanvas" ref={canvasRef} />;
};
