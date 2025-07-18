import { setupFaceMesh, startInference, stopInference } from "./eyetracking.js";

let videoElement;
let canvasElement;
let isInitialized = false;

export function initEyeTracking({
    containerId = null,
    video = null,
    canvas = null,
    hide = true,
    onReady = null, // optional callback
    onGaze = null, // 👈 add this
  } = {}) {
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
    navigator.mediaDevices.getUserMedia({   video: {
      facingMode: "user"  // Ensures front-facing camera
    } }).then((stream) => {
      // Flip video horizontally if front-facing camera
      // video.style.transform = "scaleX(-1)";
      // video.style.transformOrigin = "center center";

      video.srcObject = stream;
      setupFaceMesh(video, canvas, () => {
        isInitialized = true;
        console.log("initialised, ready to run eyetracking")
        if (onReady) onReady();
      }, onGaze); // 👈 forward to setupFaceMesh
    });
  
    videoElement = video;
    canvasElement = canvas;
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
  
    // // Remove elements from DOM
    // videoElement?.remove();
    // canvasElement?.remove();
  
    // // Reset refs
    // videoElement = null;
    // canvasElement = null;

}
  
