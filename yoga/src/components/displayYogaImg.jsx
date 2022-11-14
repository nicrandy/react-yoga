import { useState } from "react";
// import data from "../workouts/BeginnerPoses/poseInfo.json";
import "../css/displayYogaPoseImage.css";

export const DispImage = (props) => {
  // const [poseNumber, setPose] = useState("");
  // const [folderName, setPoseName] = useState("");
  // const [displayImagesArray, setDisplayImagesArray] = useState([]);
  // const [currentImageLocation, setCurrentImageLocation] = useState("");

  // var imageFileBaseLocation = 'https://f004.backblazeb2.com/file/yogaImages/BeginnerPoses/'
  console.log("props", props);
  console.log(props.currentPose);
  console.log(props.folderName);


  console.log(props.poseLocationArray[props.currentPose]);
  var imageFileBaseLocation = 'src/workouts/' + props.folderName + '/' + props.poseLocationArray[props.currentPose] + '.png';
  //get current image from data
  // setPose(props.currentPose);

  // console.log("workoutinfo obj ", props.workoutInfo)


  // const workoutInfo = props.workoutInfo;
  // setPoseName(workoutInfo.Folder_name);
  // setDisplayImagesArray(workoutInfo.Display_images.split(","));
  // setCurrentImageLocation(imageFileBaseLocation + displayImagesArray[poseNumber]);




  return (
      <img className="yogaImage" src={imageFileBaseLocation} alt="yoga pose" />
  );
};
