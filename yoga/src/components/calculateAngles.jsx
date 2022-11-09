import React from "react";
// import { useState } from "react";
import data from '../workouts/BeginnerPoses/poseInfo.json'
import "../css/calculateAngles.css";


export const CalcAngles = (props) => {
    // take in landmarks and convert to 2D array [x,y,z,visibility]
    // 32 landmarks with 4 numerical locations each
    function convertLandmarkObjectToArray(landmarks) {
        let landmarkArray = [];
        for (let i = 0; i < landmarks.length; i++) {
            landmarkArray.push([landmarks[i].x, landmarks[i].y, landmarks[i].z, landmarks[i].visibility]);
        }
        return landmarkArray;
    }

    // convert from 3D array to object with x,y,z,visibility
    function convertLandmarkArrayToObject(landmarkArray) {
        let landmarkObject = [];
        for (let i = 0; i < landmarkArray.length; i++) {
            landmarkObject[i] = {
                x: parseFloat(landmarkArray[i][0]),
                y: parseFloat(landmarkArray[i][1]),
                z: parseFloat(landmarkArray[i][2]),
                visibility: parseFloat(landmarkArray[i][3])
            }
        }
        return landmarkObject;
    }

    function getTargetLandmarks() {
        for (let i = 0; i < data.length; i++) {
            if (data[i].PoseNumber == props.currentPose) {
                return convertLandmarkArrayToObject(data[i].Landmarks);
            }
        }
    }

    // take in the landmarks object and calculat the angles of landmarks
    function CalculateAngle(coord1, coord2, coord3) {
        const v1 = {
            x: coord1.x - coord2.x,
            y: coord1.y - coord2.y,
            z: coord1.z - coord2.z,
        };
        const v2 = {
            x: coord3.x - coord2.x,
            y: coord3.y - coord2.y,
            z: coord3.z - coord2.z,
        };
        // Normalize v1
        const v1mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const v1norm = {
            x: v1.x / v1mag,
            y: v1.y / v1mag,
            z: v1.z / v1mag,
        };
        // Normalize v2
        const v2mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
        const v2norm = {
            x: v2.x / v2mag,
            y: v2.y / v2mag,
            z: v2.z / v2mag,
        };
        // Calculate the dot products of vectors v1 and v2
        const dotProducts = v1norm.x * v2norm.x + v1norm.y * v2norm.y + v1norm.z * v2norm.z;
        // Extract the angle from the dot products
        const angle = (Math.acos(dotProducts) * 180.0) / Math.PI;
        // Round result to 3 decimal points and return
        return Math.round(angle);
    };

    // calculate angle of joints. Take in landmarks object and return an array with the angles
    // middle landmark is the fixed point
    function CalculateAllAngles(landmarks) {
        // check to see if landmarks is empty
        if (landmarks === undefined) {
            return;
        }
        let allLandmarkAngles = [];
        let allToGroundAngles = [];
        // shoulders
        let leftShoulderAngle = CalculateAngle(landmarks[13], landmarks[11], landmarks[23]);
        let rightShoulderAngle = CalculateAngle(landmarks[14], landmarks[12], landmarks[24]);
        // elbows
        let leftElbowAngle = CalculateAngle(landmarks[11], landmarks[13], landmarks[15]);
        let rightElbowAngle = CalculateAngle(landmarks[12], landmarks[14], landmarks[16]);
        // wrists
        let leftWristAngle = CalculateAngle(landmarks[13], landmarks[15], landmarks[17]);
        let rightWristAngle = CalculateAngle(landmarks[14], landmarks[16], landmarks[18]);
        // feet
        let leftFootAngle = CalculateAngle(landmarks[25], landmarks[27], landmarks[31]);
        let rightFootAngle = CalculateAngle(landmarks[26], landmarks[28], landmarks[32]);
        // hips    
        let leftHipAngle = CalculateAngle(landmarks[11], landmarks[23], landmarks[25]);
        let rightHipAngle = CalculateAngle(landmarks[12], landmarks[24], landmarks[26]);
        // knees
        let leftKneeAngle = CalculateAngle(landmarks[23], landmarks[25], landmarks[27]);
        let rightKneeAngle = CalculateAngle(landmarks[24], landmarks[26], landmarks[28]);
        // upper arms to ground
        let leftArmAngleToGroundMiddlePoint = { "x": landmarks[11].x, "y": 10, "z": landmarks[11].z };
        let leftArmAngleToGround = CalculateAngle(leftArmAngleToGroundMiddlePoint, landmarks[11], landmarks[13]);
        let rightArmAngleToGroundMiddlePoint = { "x": landmarks[12].x, "y": 10, "z": landmarks[12].z };
        let rightArmAngleToGround = CalculateAngle(rightArmAngleToGroundMiddlePoint, landmarks[12], landmarks[14]);
        // lower arms to ground
        let leftForearmAngleToGroundMiddlePoint = { "x": landmarks[13].x, "y": 10, "z": landmarks[13].z };
        let leftForearmAngleToGround = CalculateAngle(leftForearmAngleToGroundMiddlePoint, landmarks[13], landmarks[15]);
        let rightForearmAngleToGroundMiddlePoint = { "x": landmarks[14].x, "y": 10, "z": landmarks[14].z };
        let rightForearmAngleToGround = CalculateAngle(rightForearmAngleToGroundMiddlePoint, landmarks[14], landmarks[16]);
        // upper legs to ground
        let leftLegAngleToGroundMiddlePoint = { "x": landmarks[23].x, "y": 10, "z": landmarks[23].z };
        let leftLegAngleToGround = CalculateAngle(leftLegAngleToGroundMiddlePoint, landmarks[23], landmarks[25]);
        let rightLegAngleToGroundMiddlePoint = { "x": landmarks[24].x, "y": 10, "z": landmarks[24].z };
        let rightLegAngleToGround = CalculateAngle(rightLegAngleToGroundMiddlePoint, landmarks[24], landmarks[26]);
        // lower legs to ground
        let leftShinAngleToGroundMiddlePoint = { "x": landmarks[25].x, "y": 10, "z": landmarks[25].z };
        let leftShinAngleToGround = CalculateAngle(leftShinAngleToGroundMiddlePoint, landmarks[25], landmarks[27]);
        let rightShinAngleToGroundMiddlePoint = { "x": landmarks[26].x, "y": 10, "z": landmarks[26].z };
        let rightShinAngleToGround = CalculateAngle(rightShinAngleToGroundMiddlePoint, landmarks[26], landmarks[28]);
        // upper body to ground (shoulders to hips angle in relation to the ground)
        let leftShoulderToHipsAngleToGroundMiddlePoint = { "x": landmarks[23].x, "y": 10, "z": landmarks[23].z };
        let leftShoulderToHipsAngleToGround = CalculateAngle(leftShoulderToHipsAngleToGroundMiddlePoint, landmarks[23], landmarks[11]);
        let rightShoulderToHipsAngleToGroundMiddlePoint = { "x": landmarks[24].x, "y": 10, "z": landmarks[24].z };
        let rightShoulderToHipsAngleToGround = CalculateAngle(rightShoulderToHipsAngleToGroundMiddlePoint, landmarks[24], landmarks[12]);

        allLandmarkAngles = [leftWristAngle, rightWristAngle, leftShoulderAngle, rightShoulderAngle, leftElbowAngle, rightElbowAngle, leftHipAngle, rightHipAngle, leftKneeAngle, rightKneeAngle, leftFootAngle, rightFootAngle];
        allToGroundAngles = [leftArmAngleToGround, rightArmAngleToGround, leftForearmAngleToGround, rightForearmAngleToGround, leftLegAngleToGround, rightLegAngleToGround, leftShinAngleToGround, rightShinAngleToGround, leftShoulderToHipsAngleToGround, rightShoulderToHipsAngleToGround];
        let angles = [leftWristAngle, rightWristAngle, leftShoulderAngle, rightShoulderAngle, leftElbowAngle, rightElbowAngle, leftHipAngle, rightHipAngle, leftKneeAngle, rightKneeAngle, leftFootAngle, rightFootAngle, leftArmAngleToGround, rightArmAngleToGround, leftForearmAngleToGround, rightForearmAngleToGround, leftLegAngleToGround, rightLegAngleToGround, leftShinAngleToGround, rightShinAngleToGround, leftShoulderToHipsAngleToGround, rightShoulderToHipsAngleToGround];
        return angles;

    }

    // normalize the landmarks
    function NormalizeLandmarks(landmarks) {
        // check to see if landmarks is empty
        if (landmarks === undefined) {
            return;
        }
        let normalizedLandmarks = [];
        let normalizedLandmark = {};
        let minX = 100000;
        let minY = 100000;
        let minZ = 100000;
        let maxX = -100000;
        let maxY = -100000;
        let maxZ = -100000;
        // find the min and max values for x, y, and z
        for (let i = 0; i < landmarks.length; i++) {
            if (landmarks[i].x < minX) {
                minX = landmarks[i].x;
            }
            if (landmarks[i].y < minY) {
                minY = landmarks[i].y;
            }
            if (landmarks[i].z < minZ) {
                minZ = landmarks[i].z;
            }
            if (landmarks[i].x > maxX) {
                maxX = landmarks[i].x;
            }
            if (landmarks[i].y > maxY) {
                maxY = landmarks[i].y;
            }
            if (landmarks[i].z > maxZ) {
                maxZ = landmarks[i].z;
            }
        }
        // normalize the landmarks
        for (let i = 0; i < landmarks.length; i++) {
            normalizedLandmark = { "x": (landmarks[i].x - minX) / (maxX - minX), "y": (landmarks[i].y - minY) / (maxY - minY), "z": (landmarks[i].z - minZ) / (maxZ - minZ) };
            normalizedLandmarks.push(normalizedLandmark);
        }
        return normalizedLandmarks;
    }

    // compare the coordinates of the landmarks to the coordinates of the landmarks from the previous frame
    function CompareLandmarks(landmarks, targetLandmarks) {
        // check to see if landmarks is empty
        if (landmarks === undefined) {
            return;
        }
        let landmarkDifferences = [];
        let landmarkDifference = [];
        // compare the coordinates of the landmarks to the coordinates of the target landmarks
        for (let i = 0; i < landmarks.length; i++) {
            landmarkDifference = { "x": landmarks[i].x - targetLandmarks[i].x, "y": landmarks[i].y - targetLandmarks[i].y, "z": landmarks[i].z - targetLandmarks[i].z };
            landmarkDifferences.push(landmarkDifference);
        }
        return landmarkDifferences;
    }
    //iterate through the landmark differences and calculate the total difference
    function CalculateTotalDifference(landmarkDifferences) {
        // check to see if landmarkDifferences is empty
        let totalDifference = 0;
        for (let i = 0; i < landmarkDifferences.length; i++) {
            totalDifference += Math.abs(landmarkDifferences[i].x) + Math.abs(landmarkDifferences[i].y) + Math.abs(landmarkDifferences[i].z);
        }
        return totalDifference;
    }


    
    if (props.landmarks !== undefined) {
        // normalize the landmarks for target and user
        let normalizedUserLandmarks = NormalizeLandmarks(props.landmarks);
        let targetLandmarksObj = getTargetLandmarks()
        let normalizedTargetLandmarks = NormalizeLandmarks(targetLandmarksObj);
        // compare the locations of the landmarks
        let landmarkDifferences = CompareLandmarks(normalizedUserLandmarks, normalizedTargetLandmarks);
        let totalLandmarkDistanceScore = parseInt(CalculateTotalDifference(landmarkDifferences));
        console.log("total landmark distance score: " , totalLandmarkDistanceScore);


        let angles = CalculateAllAngles(props.landmarks);
        let angleNames = ["leftWristAngle", "rightWristAngle", "leftShoulderAngle", "rightShoulderAngle", "leftElbowAngle", "rightElbowAngle", "leftHipAngle", "rightHipAngle", "leftKneeAngle", "rightKneeAngle", "leftFootAngle", "rightFootAngle", "leftArmAngleToGround", "rightArmAngleToGround", "leftForearmAngleToGround", "rightForearmAngleToGround", "leftLegAngleToGround", "rightLegAngleToGround", "leftShinAngleToGround", "rightShinAngleToGround", "leftShoulderToHipsAngleToGround", "rightShoulderToHipsAngleToGround"];
        let targetPoseAngles = CalculateAllAngles(getTargetLandmarks());
        let differences = [];
        for (let i = 0; i < angles.length; i++) {
            differences.push( Math.abs(angles[i] - targetPoseAngles[i]));
        }
        // get sum of differences
        let sum = 0;
        const differencesReducer = (accumulator, currentValue) => accumulator + currentValue;
        sum = differences.reduce(differencesReducer);
        let score = parseInt((2000 - differences.reduce(differencesReducer)) / 10 - 50);
        return (
            <>
            <div className="DataDisplay">
                <ul id="userData">
                    {angles.map(function (angle, index) {
                        return <h4 key={index}>{angleNames[index]} {angle}</h4>;
                    })}
                </ul>
                <ul id="targetData">
                    {targetPoseAngles.map(function (angle, index) {
                        return <h4 key={index}>-{angle}</h4>;
                    })}
                </ul>
                <ul id="difference">
                    {differences.map(function (angle, index) {
                        return <h4 key={index}>={angle}</h4>;
                    })}
                    Sum: {sum}
                </ul>
            </div>
            <div className="ScoreDisplay">
                <h1>Score: {score} / {totalLandmarkDistanceScore}</h1>
            </div>
            </>
        );
    }
    else{
        return (
            <div>
                <h1>No person detected</h1>
            </div>
            );
    }
};