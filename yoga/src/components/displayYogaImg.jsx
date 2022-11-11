// import { useState } from "react";
import data from "../workouts/BeginnerPoses/poseInfo.json";
import "../css/displayYogaPoseImage.css";

export const DispImage = (props) => {
  //get current image from data
  let currentPose = props.currentPose;
  let side = "front";

  // var imageFileBaseLocation = 'https://f004.backblazeb2.com/file/yogaImages/BeginnerPoses/'
  var imageFileBaseLocation = 'src/workouts/BeginnerPoses/'


  
  for (let i = 0; i < data.length; i++) {
    if (data[i].PoseNumber == currentPose && data[i].FrontOrSide == side) {
      imageFileBaseLocation += data[i].RelativeLocation;
      break;
    }
  }
  return (
      <img className="yogaImage" src={imageFileBaseLocation} alt="yoga pose" />
  );
};
