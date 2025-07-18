import { Tensor, InferenceSession, env } from "onnxruntime-web";

let myOnnxSession = null;

async function loadModel() {
  if (myOnnxSession) return;
  
  myOnnxSession = await InferenceSession.create(
    "model/peekr.onnx",
    {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    }
  );
  console.log("Model loaded successfully");
  postMessage({type: "modelLoaded"})
}

loadModel().catch((err) => {
  postMessage({ type: "modelLoadFailed", error: err.message });
  console.error("Failed to load model:", err);
});

onmessage = async function (e) {
  try {
    if (!myOnnxSession) throw new Error("Model not initialized");

    const input1 = new Tensor("float32", e.data.input1.data, [1, 3, 128, 128]);
    const input2 = new Tensor("float32", e.data.input2.data, [1, 3, 128, 128]);
    const kpsTensor = new Tensor("float32", e.data.kpsTensor.data, [1, 8]);

    const result = await myOnnxSession.run({ input1, input2, kps: kpsTensor });
    postMessage(result); 
  } catch (error) {
    console.error("[Worker]: Error processing message", error);
    postMessage({ error: error.message });
  }
};
