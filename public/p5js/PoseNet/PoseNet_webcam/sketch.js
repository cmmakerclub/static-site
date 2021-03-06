// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let nose;
let isModelReady;
let img1;
let jokerMode = false;

function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf("IEMobile") !== -1);
};

function setup() {
  createCanvas(640, 480);
  if (isMobileDevice()) {
    video = createCapture({
      audio: false,
      video: {
        facingMode: {
          exact: "user"
        }
      }
    });
  } else {
    video = createCapture(VIDEO);
  }

  video.size(width, height);
  img1 = createImg("joker.png");

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    //console.log("on pose");
    poses = results;
    if (poses.length > 0) {
      let pose = poses[0].pose;
      nose = pose.keypoints[0].position;
    }
  });

  poseNet.on("singlePose", function(pose) {
    console.log("singlePose");
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select("#status").html("Model Loaded");
  isModelReady = true;
}

function draw() {
  //imageMode(CORNERS);
  image(video, 0, 0, 640, 480);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
  if (isModelReady) {
    textSize(64);
    text(Math.floor(frameRate()), 20, height / 2);
  }
  if (nose) {
    stroke(0, 255, 0);
    strokeWeight(16);
    point(nose.x, nose.y);
    //imageMode(CENTER);
    if (jokerMode) {
      img1.position(nose.x - 100, nose.y - 30, 0, 0);
    } else {
      img1.position(0, 0, 0, 0);
    }
  }
}

function mouseReleased() {
  jokerMode = !jokerMode;
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
