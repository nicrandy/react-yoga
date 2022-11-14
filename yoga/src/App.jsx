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

  function parseThisWorkoutPoseInfo(poseData){
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
    console.log("this pose landmarks: ", poseLandmarksArray);
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

  // get info from data and set total number of poses
  useEffect(() => {
    const interval = setInterval(() => {
      updatePoseCount();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("This will run every 10 second!", currentPose);
    if (currentPose >= thisWorkoutData.NumOfPoses) {
      setCurrentPose(1);
    }
    // if (currentPose >= 3) {
    //   setCurrentPose(1);
    // }
  }, [currentPose]);

  function updatePoseCount() {
    setCurrentPose((currentPose) => currentPose + 1);
  }

  // console.log("bounding box", boundingBox);
  // console.log("normalized landmarks", normalizedLandmarks);
  // console.log("scores", scores[0], scores[1]);
  // var imageFileBaseLocation = 'src/workouts/' + props.folderName + '/' + props.poseLocationArray[props.currentPose] + '.png';

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
                thisWorkoutData.Best_pose_image.split(",")[currentPose] +
                ".png"
              }
              alt="yoga pose"
            />
          )}
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
          Pose: {currentPose + 1} -  Score: {scores[0]} / {scores[1]}
        </h1>
      </div>
      {/* <Data /> */}
    </div>
  );
}

export default App;
