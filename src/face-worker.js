/*
 * Web Worker hosting MediaPipe FaceLandmarker.
 * Receives ImageBitmap frames from the main thread, runs detection,
 * returns the eye-corner landmark subset.
 */
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const EYE_LANDMARK_INDICES = [130, 27, 243, 23, 463, 257, 359, 253];

let faceLandmarker = null;
let initPromise = null;

async function init({ wasmDir, modelPath }) {
  const fileset = await FilesetResolver.forVisionTasks(wasmDir);
  faceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: modelPath,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}

self.onmessage = async (e) => {
  const msg = e.data;

  if (msg.type === "init") {
    if (!initPromise) initPromise = init(msg);
    try {
      await initPromise;
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "initError", message: err.message });
    }
    return;
  }

  if (msg.type === "detect") {
    if (!faceLandmarker) {
      msg.bitmap.close();
      return;
    }
    let result;
    try {
      result = faceLandmarker.detectForVideo(msg.bitmap, msg.timestamp);
    } catch (err) {
      msg.bitmap.close();
      self.postMessage({ type: "detectError", message: err.message });
      return;
    }
    msg.bitmap.close();

    const faces = result.faceLandmarks;
    if (!faces || faces.length === 0) return;

    const landmarks = faces[0];
    const eyeCorners = EYE_LANDMARK_INDICES.map((i) => ({
      x: landmarks[i].x,
      y: landmarks[i].y,
    }));
    self.postMessage({ type: "landmarks", eyeCorners });
  }
};
