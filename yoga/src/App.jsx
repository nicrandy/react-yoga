import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import allData from "./assets/exerciseInfo.json"; // read the data from the json file

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
  // add data
  const [allWorkoutData, setAllWorkoutData] = useState([]); // data for all available workouts
  const [workoutName, setWorkoutName] = useState("demo"); // folder name for workout
  const [thisWorkoutData, setThisWorkoutData] = useState({}); // data for this workout only
  const [thisWorkoutPoseLandmarks, setThisWorkoutPoseLandmarks] = useState({}); // data for this workout pose landmarks
  const [thisPoseLandmarks, setThisPoseLandmarks] = useState({}); // data for this pose landmarks
  // use state for loading message
  const [loadingMsg, setLoading] = useState("Loading AI Model...");
  const [currentOutput, setCurrentOutput] = useState(); // holds .image , .poseLandmarks , .poseWorldLandmarks
  const [currentLandmarks, setCurrentLandmarks] = useState(); // holds .poseLandmarks
  const [normalizedLandmarks, setNormalizedLandmarks] = useState(); // normalized landmarks so x,y and z are all between 0 and 1
  const [scores, setScores] = useState([,]); // scores as calculated in calculate angles
  const poseRef = useRef(null);
  const webcamRef = useRef();
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [currentPose, setCurrentPose] = useState(1); // start with pose 1
  const [boundingBox, setBoundingBox] = useState([]); // get the x and y min and max from landmarks
  const [currentState, setCurrentState] = useState(0); // track the current state
  const [countdownTimer, setCountdownTimer] = useState(10); // track the current state
  const [saveDataTimer, setSaveDataTimer] = useState(0); // track the time to save landmark and pose data
  const [dataToSave, setDataToSave] = useState([]); // track the time to save landmark and pose data

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimer((countdownTimer) => countdownTimer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (countdownTimer == 0) {
      setCountdownTimer(10);
    }
  }, [countdownTimer]);

  const intervalToSaveData = 300; // save data every 500 ms
  useEffect(() => {
    const interval = setInterval(() => {
      setSaveDataTimer((saveDataTimer) => saveDataTimer - intervalToSaveData);
    }, intervalToSaveData);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (saveDataTimer <= 0) {
      setSaveDataTimer(intervalToSaveData);
      if (currentLandmarks) {
        console.log("+++ save data", currentLandmarks, currentPose, scores);
        setDataToSave((dataToSave) => [
          ...dataToSave,
          [currentLandmarks, currentPose, scores],
        ]);
      }
    }
  }, [saveDataTimer]);

  // segmentation canvas
  // useEffect(() => {

  // }, []);

  function onResults(results) {
    setLoading("Model Loaded");
    if (results) {
      setCurrentOutput(results);
      if (results.segmentationMask) {
        // for segmentation mask
        let bgImage = new Image();
        bgImage.src = "src/assets/beachBG.jpg";
        // let yogaImage = new Image();
        // yogaImage.src =
        //   "src/workouts/" +
        //   thisWorkoutData.Folder_name +
        //   "/" +
        //   thisWorkoutData.Best_pose_image.split(",")[currentPose - 1] +
        //   ".png";
        bgImage.onload = function () {
          // for segmentation mask
          const canvasElement =
            document.getElementsByClassName("segmentationCanvas")[0];
          const canvasCtx = canvasElement.getContext("2d");
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          canvasCtx.drawImage(
            results.segmentationMask,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );

          canvasCtx.globalCompositeOperation = "source-out";
          canvasCtx.drawImage(
            bgImage,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );
          // Only overwrite missing pixels.
          canvasCtx.globalCompositeOperation = "destination-atop";
          canvasCtx.drawImage(
            // results.image,
            webcamRef.current.video,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );
          // draw yoga image on top
          // canvasCtx.globalCompositeOperation = "source-over";
          // canvasCtx.drawImage(
          //   yogaImage,
          //   0,
          //   0,
          //   canvasElement.width,
          //   canvasElement.height
          // );
          canvasCtx.restore();
        };
      }
      else {
        let bgImage = new Image();
        bgImage.src = "src/assets/beachBG.jpg";
        bgImage.onload = function () {
          // for segmentation mask
          const canvasElement =
            document.getElementsByClassName("segmentationCanvas")[0];
          const canvasCtx = canvasElement.getContext("2d");
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          canvasCtx.drawImage(
            // results.image,
            webcamRef.current.video,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );
          canvasCtx.restore();
        };
      }

      try {
        setCurrentLandmarks(results.poseLandmarks);
      } catch (error) {
        console.log("No landmarks: ", error);
      }
    }
  }

  useEffect(() => {
    setAllWorkoutData(allData);
  }, []);
  function parseAllWorkoutData() {
    for (let i = 0; i < allWorkoutData.length; i++) {
      if (allWorkoutData[i].Folder_name == workoutName) {
        setThisWorkoutData(allWorkoutData[i]);
        console.log("thisWorkoutData", allWorkoutData[i]);
        break;
      }
    }
  }
  useEffect(() => {
    parseAllWorkoutData();
  }, [allWorkoutData]);

  // get specific data for this workout
  const getData = (fileLocation) => {
    console.log("this  workout data: ", thisWorkoutData.Folder_name);
    console.log("json location: ", fileLocation);
    fetch(fileLocation, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (response) {
        console.log(response);
        return response.json();
      })
      .then(function (myJson) {
        parseThisWorkoutPoseInfo(myJson);
      });
  };
  useEffect(() => {
    console.log("props.workoutData", thisWorkoutData.Folder_name);
    let fileLocation =
      "src/workouts/" + thisWorkoutData.Folder_name + "/poseInfo.json";

    getData(fileLocation);
  }, [thisWorkoutData]);

  function parseThisWorkoutPoseInfo(poseData) {
    setThisWorkoutPoseLandmarks(poseData);
    console.log("pose data: ", poseData);
  }
  useEffect(() => {
    let poseLandmarksArray = [];
    for (let i = 0; i < thisWorkoutPoseLandmarks.length; i++) {
      if (thisWorkoutPoseLandmarks[i].PoseNumber == currentPose) {
        poseLandmarksArray.push(thisWorkoutPoseLandmarks[i].Landmarks);
      }
    }
    setThisPoseLandmarks(poseLandmarksArray);
  }, [currentPose]);

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
      enableSegmentation: true,
      smoothSegmentation: true,
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

  // set timer for 10 seconds then move to next pose
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     updatePoseCount();
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  // loop workout poses
  // useEffect(() => {
  //   if (currentPose >= thisWorkoutData.NumOfPoses) {
  //     setCurrentPose(1);
  //   }
  // }, [currentPose]);

  useEffect(() => {
    console.log("------------update to currentstate: ", currentState);
  }, [currentState]);

  function updatePoseCount() {
    setCurrentPose((currentPose) => currentPose + 1);
    if (currentPose >= thisWorkoutData.NumOfPoses) {
      setCurrentPose(1);
    }
  }

  // communicate with confirmation circles
  // weird REact feature that updates this twice, so set check to make sure it only updates once
  var lastUpdateTime = 0; // only update if set time has passed
  function updateWorkoutRoutine() {
    if (Date.now() - lastUpdateTime > 100) {
      console.log("update workout routine");
      updatePoseCount();
      lastUpdateTime = Date.now();
    }
  }

  return (
    <div className="App">
      <div className="ImageAndOutput">
        <div className="ImageContainer">
          {Object.keys(thisWorkoutData).length > 0 && (
            // <DispImage currentPose={currentPose} folderName={thisWorkoutData.Folder_name} poseLocationArray={thisWorkoutData.Best_pose_image.split(",")} />
            <img
              className="yogaImage"
              src={
                "src/workouts/" +
                thisWorkoutData.Folder_name +
                "/" +
                thisWorkoutData.Best_pose_image.split(",")[currentPose - 1] +
                ".png"
              }
              alt="yoga pose"
            />
          )}
          <div className="greenScreenContainer">
            <span className="greenScreenText">Pose: {currentPose} - Score: {scores[0]}</span>
            <canvas
              className="segmentationCanvas"
              width={screenWidth * 2}
              height={screenHeight * 2}
            />
            {Object.keys(thisWorkoutData).length > 0 && (
              // <DispImage currentPose={currentPose} folderName={thisWorkoutData.Folder_name} poseLocationArray={thisWorkoutData.Best_pose_image.split(",")} />
              <img
                className="greenScreenPoseImage"
                src={
                  "src/workouts/" +
                  thisWorkoutData.Folder_name +
                  "/" +
                  thisWorkoutData.Best_pose_image.split(",")[currentPose - 1] +
                  ".png"
                }
                alt="yoga pose"
              />
            )}
          </div>
        </div>
        <div className="OutputParent">
          <Webcam
            className="webcam"
            audio={false}
            ref={webcamRef}
            width={screenWidth}
            height={screenHeight}
          />
          <div className="OutputChildren">
            <DrawLines
              image={currentOutput}
              landmarks={currentLandmarks}
              width={screenWidth}
              height={screenHeight}
              boundingBox={boundingBox}
              updateWithConfirmation={updateWorkoutRoutine}
              currentState={setCurrentState}
            />
          </div>
        </div>
      </div>
      {/* only call if thisworkoutdata isn't null */}
      {thisWorkoutData && (
        <CalcAngles
          workoutData={thisWorkoutData}
          currentPose={currentPose}
          landmarks={currentLandmarks}
          poseLandmarks={thisPoseLandmarks}
          setBoundingBox={setBoundingBox}
          normalizedLandmarks={setNormalizedLandmarks}
          scores={setScores}
        />
      )}
      <div className="ScoreDisplay">
        <h1>
          {workoutName} - Pose: {currentPose} - Score: {scores[0]} / {scores[1]}
        </h1>
      </div>
      {/* <Data /> */}
    </div>
  );
}

export default App;
