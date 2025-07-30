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
    containerId = null,
    video = null,
    canvas = null,
    hide = true,
    onReady = null, // optional callback
    onGaze = null, // 👈 add this
  } = {}
) {
  const container = containerId ? document.getElementById(containerId) : document.body;

  if (!video) {
    video = document.createElement("video");
    video.className = "inputVideo";
    video.autoplay = true;
    video.playsInline = true;
    if (hide) video.style.display = "none";
    container.appendChild(video);
  }

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "headCanvas";
    if (hide) canvas.style.display = "none";
    container.appendChild(canvas);
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
      onGaze
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
  
