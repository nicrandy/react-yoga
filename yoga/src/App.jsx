import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

import { Camera } from "@mediapipe/camera_utils";
import {
  Pose,
  POSE_CONNECTIONS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_NEUTRAL,
  POSE_LANDMARKS_RIGHT,
  Results,
} from "@mediapipe/pose";

import "./css/App.css";
import { CalcAngles } from "./components/calculateAngles";
import { DrawLines } from "./components/landmarkLines";
import { Data } from "./components/data";
import { DispImage } from "./components/displayYogaImg";

function App() {
  // use state for loading message
  const [loadingMsg, setLoading] = useState("Loading AI Model...");
  const [currentOutput, setCurrentOutput] = useState(); // holds .image , .poseLandmarks , .poseWorldLandmarks
  const [currentLandmarks, setCurrentLandmarks] = useState(); // holds .poseLandmarks

  const poseRef = useRef(null);
  const webcamRef = useRef();
  const canvasRef = useRef();
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [currentPose, setCurrentPose] = useState(8);

  function onResults(results) {
    setLoading("Model Loaded");
    if (results) {
      setCurrentOutput(results);
      try {
        setCurrentLandmarks(results.poseLandmarks);
      } catch (error) {
        console.log("No landmarks: ", error);
      }
    }
  }

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });
    poseRef.current = pose;

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          webcamRef.current &&
            (await pose.send({ image: webcamRef.current.video }));
        },
      });
      camera.start();
      console.log(camera.h.width);
      setScreenWidth(camera.h.width);
      setScreenHeight(camera.h.height);
    } else {
      console.log("Webcam not ready");
    }
  }, []);

  return (
    <div className="App">
      <DispImage currentPose={currentPose} />
      <Webcam
        className="webcam"
        audio={false}
        ref={webcamRef}
        width={screenWidth}
        height={screenHeight}
      />
      <DrawLines
        image={currentOutput}
        landmarks={currentLandmarks}
        width={screenWidth}
        height={screenHeight}
      />
      <CalcAngles currentPose={currentPose} landmarks={currentLandmarks} />
      {/* <Data /> */}
    </div>
  );
}

export default App;
