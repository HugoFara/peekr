/*
 * Handles video input and communication with the face-detection and
 * gaze-inference workers.
 *
 * Pipeline per video frame:
 *   video frame ready (rVFC)
 *     → createImageBitmap (transferable)
 *     → faceWorker.detectForVideo  (runs in its own thread)
 *     → eye-corner landmarks come back
 *     → main thread crops the eye regions, preprocesses tensors
 *     → onnxWorker.run gaze inference
 */
import ndarray from "ndarray";
import ops from "ndarray-ops";

let rafId;
let continueProcessing = false;
let eyeTrackingWorker = null;
let faceWorker = null;
let detectInFlight = false;
let inputVideo;
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

    if (type === "modelLoaded") {
      if (onModelReady) onModelReady();
      return;
    }

    if (type === "modelLoadFailed") {
      console.error("Gaze model failed to load inside worker");
      return;
    }

    if (onGazeCallback) onGazeCallback(data);
  };

  return eyeTrackingWorker;
}

function setupFaceWorker(onReady) {
  // Classic (non-module) worker: tasks-vision's WASM-glue loader uses
  // `importScripts`, which only exists in classic workers. In a module
  // worker its loader can't expose `ModuleFactory` on the worker global
  // and init throws "ModuleFactory not set." (upstream issue #5527).
  faceWorker = new Worker(
    new URL('./face-worker.js', import.meta.url)
  );

  faceWorker.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === "ready") {
      onReady();
    } else if (msg.type === "landmarks") {
      detectInFlight = false;
      onLandmarks(msg.eyeCorners);
    } else if (msg.type === "detectError") {
      detectInFlight = false;
      console.warn(`FaceLandmarker detect error: ${msg.message}`);
    } else if (msg.type === "initError") {
      console.error(`FaceLandmarker init error: ${msg.message}`);
    }
  };

  const base = import.meta.env.BASE_URL || '/';
  faceWorker.postMessage({
    type: "init",
    wasmDir: new URL(`${base}tasks-vision/wasm`, location.href).href,
    modelPath: new URL(`${base}tasks-vision/face_landmarker.task`, location.href).href,
  });
}

export function setupFaceMesh(video, onReady, onGaze, leftCanvas = null, rightCanvas = null) {
  inputVideo = video;

  if (leftCanvas && rightCanvas) {
    leftEyeCanvas = leftCanvas;
    rightEyeCanvas = rightCanvas;
    leftEyectx = leftEyeCanvas.getContext("2d", { willReadFrequently: true });
    rightEyectx = rightEyeCanvas.getContext("2d", { willReadFrequently: true });
  }

  const gazeReady = createReadiness();
  const faceReady = createReadiness();

  eyeTrackingWorker = createWorker(onGaze, gazeReady.resolve);
  setupFaceWorker(faceReady.resolve);

  Promise.all([gazeReady.promise, faceReady.promise]).then(() => {
    if (onReady) onReady();
  });

  inputVideo.addEventListener("play", () => {
    continueProcessing = true;
  });
}

function createReadiness() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}

export function startInference() {
  continueProcessing = true;

  const useRvfc = typeof inputVideo.requestVideoFrameCallback === 'function';

  function step() {
    if (!continueProcessing) return;

    if (
      !detectInFlight
      && faceWorker
      && inputVideo.readyState >= 2
      && inputVideo.videoWidth > 0
    ) {
      detectInFlight = true;
      const timestamp = performance.now();
      createImageBitmap(inputVideo).then((bitmap) => {
        if (!continueProcessing) {
          bitmap.close();
          detectInFlight = false;
          return;
        }
        faceWorker.postMessage(
          { type: "detect", bitmap, timestamp },
          [bitmap]
        );
      }).catch((err) => {
        detectInFlight = false;
        console.warn(`createImageBitmap failed: ${err.message}`);
      });
    }

    scheduleNext();
  }

  function scheduleNext() {
    if (!continueProcessing) return;
    if (useRvfc) {
      rafId = inputVideo.requestVideoFrameCallback(step);
    } else {
      rafId = requestAnimationFrame(step);
    }
  }

  scheduleNext();
}

export function stopInference() {
  continueProcessing = false;

  if (rafId !== null) {
    if (inputVideo && typeof inputVideo.cancelVideoFrameCallback === 'function') {
      inputVideo.cancelVideoFrameCallback(rafId);
    }
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}


function onLandmarks(eyeCorners) {
  const w = inputVideo.videoWidth;
  const h = inputVideo.videoHeight;

  const leftEyeCoor = eyeCorners.slice(0, 4).map((p) => [p.x, p.y]);
  const rightEyeCoor = eyeCorners.slice(4, 8).map((p) => [p.x, p.y]);

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

  ops.divseq(dataFromImage, 255.0);
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
