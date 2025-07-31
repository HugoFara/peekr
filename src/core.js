/*
 * Core logic for initializing, running, and stopping eye tracking; filtering
 */
import KalmanFilter from 'kalmanjs';
import { setupFaceMesh, startInference, stopInference } from "./eyetracking.js";

let isInitialized = false;
const kalmanFilters = {
  x: new KalmanFilter(),
  y: new KalmanFilter()
};

export function applyFilter(x, y) {
  return [ kalmanFilters.x.filter(x), kalmanFilters.y.filter(y) ];
}

export function initEyeTracking(
  {
    video = null,
    canvas = null,
    leftEyeCanvas = null,
    rightEyeCanvas = null,
    onReady = null, // optional callback
    onGaze = null, // 👈 add this
  } = {}
) {
  if (!video || !canvas) {
    console.error("Video and canvas elements must be provided");
    return;
  }
  
  console.log("initialising ...")
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user"  // Ensures front-facing camera
    }
  }).then((stream) => {
    video.srcObject = stream;
    setupFaceMesh(video,
      () => {
        isInitialized = true;
        console.log("initialised, ready to run eyetracking")
        if (onReady) onReady();
      },
      onGaze,
      leftEyeCanvas,
      rightEyeCanvas
    ); // 👈 forward to setupFaceMesh
  });
}

export function runEyeTracking() {
  if (!isInitialized) {
    console.warn("Eye tracking has not been initialized. Call initEyeTracking() first.");
    return;
  }

  startInference();
}

export function stopEyeTracking() {
  stopInference();  
}
  
