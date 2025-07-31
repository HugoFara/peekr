/*
 * Handles video input, face mesh, and communication with the worker
 */
import ndarray from "ndarray";
import ops from "ndarray-ops";

let rafId;
let continueProcessing = false;
let eyeTrackingWorker = null;  // ✅ Track current worker instance
let inputVideo;
let faceMesh;
let leftEyeCanvas;
let rightEyeCanvas;
let leftEyectx;
let rightEyectx;

export function createWorker(onGazeCallback, onModelReady = null) {
  if (eyeTrackingWorker) return eyeTrackingWorker;

  eyeTrackingWorker = new Worker(
    new URL('./worker.js', import.meta.url),
    { type: 'module' }
  );

  eyeTrackingWorker.onmessage = (e) => {
    const { type, error, ...data } = e.data;

    if (error) {
      console.error("Worker error:", error);
      return;
    }

    // Handle model lifecycle messages
    if (type === "modelLoaded") {
      console.log(`ℹ️ Received "modelLoaded" from worker`);
      if (onModelReady) onModelReady();
      return;
    }

    if (type === "modelLoadFailed") {
      console.error("⚠️ Model failed to load inside worker");
      return;
    }

    // All other messages are gaze updates
    if (onGazeCallback) onGazeCallback(data);
  };

  return eyeTrackingWorker;
}

export function setupFaceMesh(video, onReady, onGaze, leftCanvas = null, rightCanvas = null) {
  inputVideo = video;
  
  // Initialize canvas elements if provided
  if (leftCanvas && rightCanvas) {
    leftEyeCanvas = leftCanvas;
    rightEyeCanvas = rightCanvas;
    leftEyectx = leftEyeCanvas.getContext("2d", { willReadFrequently: true });
    rightEyectx = rightEyeCanvas.getContext("2d", { willReadFrequently: true });
  }
  
  eyeTrackingWorker = createWorker(onGaze, () => {
    console.log("👁️ Model loaded inside worker, calling onReady");
    if (onReady) onReady();
  });
  
  faceMesh = new window.FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
  });
  
  faceMesh.setOptions({
    selfieMode: true,
    refineLandmarks: true,
    maxNumFaces: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  
  faceMesh.onResults(onResultsFaceMesh);
  
  inputVideo.addEventListener("play", () => {
    continueProcessing = true;
  });
}

export function startInference() {
  continueProcessing = true;
    
  async function run() {
    if (!continueProcessing) return;
    
    await faceMesh.send({ image: inputVideo });
    
    // Schedule next frame
    rafId = requestAnimationFrame(run);
  }
    
  run();
}
      
export function stopInference() {
  continueProcessing = false;
  
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
      

function onResultsFaceMesh(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0)
    return;

  const landmarks = results.multiFaceLandmarks[0];
  const w = inputVideo.videoWidth;
  const h = inputVideo.videoHeight;

  const leftEyeCoor = [];
  const rightEyeCoor = [];

  collectCoordinates(landmarks, [130, 27, 243, 23], leftEyeCoor);
  collectCoordinates(landmarks, [463, 257, 359, 253], rightEyeCoor);

  if (leftEyeCoor.length === 0 || rightEyeCoor.length === 0) return;

  // LEFT EYE
  let [ulx, uly, width, height] = convertToYolo(leftEyeCoor, w, h);
  const kps = [
    ulx / w,
    uly / h,
    width / w,
    height / h,
  ];

  leftEyectx.drawImage(
    inputVideo,
    Math.max(0, w - ulx - width),
    Math.max(0, uly),
    Math.max(0, width),
    Math.max(0, height),
    0,
    0,
    128,
    128
  );

  // RIGHT EYE
  [ulx, uly, width, height] = convertToYolo(rightEyeCoor, w, h);
  kps.push(
    ulx / w,
    uly / h,
    width / w,
    height / h
  );

  rightEyectx.drawImage(
    inputVideo,
    Math.max(0, w - ulx - width),
    Math.max(0, uly),
    Math.max(0, width),
    Math.max(0, height),
    0,
    0,
    128,
    128
  );

  const imageDataL = leftEyectx.getImageData(0, 0, 128, 128);
  let leftEye = preprocess(imageDataL.data, 128, 128);

  const imageDataR = rightEyectx.getImageData(0, 0, 128, 128);
  let rightEye = preprocess(imageDataR.data, 128, 128);

  let kpsTensor = preprocess_kps(kps);

  eyeTrackingWorker.postMessage({
    input1: { data: leftEye },
    input2: { data: rightEye },
    kpsTensor: { data: kpsTensor },
  });
}


function preprocess(data, width, height) {
  const dataFromImage = ndarray(new Float32Array(data), [width, height, 4]);
  const dataProcessed = ndarray(new Float32Array(width * height * 3), [
    1,
    3,
    height,
    width,
  ]);
  
  // Normalize 0-255 to 0 - 1
  ops.divseq(dataFromImage, 255.0);
  // Realign imageData from [224*224*4] to the correct dimension [1*3*224*224].
  ops.assign(
    dataProcessed.pick(0, 0, null, null),
    dataFromImage.pick(null, null, 2),
  );
  ops.assign(
    dataProcessed.pick(0, 1, null, null),
    dataFromImage.pick(null, null, 1),
  );
  ops.assign(
    dataProcessed.pick(0, 2, null, null),
    dataFromImage.pick(null, null, 0),
  );
  return new Float32Array(dataProcessed.data);
}

function preprocess_kps(data) {
  const dataFromImage = ndarray(new Float32Array(data), [data.length]);
  const dataProcessed = ndarray(new Float32Array(data.length), [
    1,
    data.length,
  ]);
  ops.assign(dataProcessed.pick(0, null), dataFromImage);
  
  return new Float32Array(dataProcessed.data);
}

function convertToYolo(feature, w, h) {
  let centerx = (feature[0][0] + feature[2][0]) / 2.0;
  let centery = (feature[1][1] + feature[3][1]) / 2.0;
  let width = feature[2][0] - feature[0][0];
  let height = feature[3][1] - feature[1][1];
  let box = [centerx, centery, width, height];
  let upper_left_x = (box[0] - box[2] / 2) * w;
  let upper_left_y = (box[1] - box[3] / 2) * h;
  width = box[2] * w;
  height = box[3] * h;
  return [upper_left_x, upper_left_y, width, height];
}

function collectCoordinates(landmarks, indices, coordinates) {
  indices.forEach((index) => {
    const point = landmarks[index];
    coordinates.push([point.x, point.y]);
  });
}
  