import { Tensor, InferenceSession } from "onnxruntime-web";

let onnxSession = null;

async function loadModel() {
  if (onnxSession) return;
  
  onnxSession = await InferenceSession.create(
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

async function runInference(input1, input2, kps) {
    const inputTensor1 = new Tensor("float32", input1.data, [1, 3, 128, 128]);
    const inputTensor2 = new Tensor("float32", input2.data, [1, 3, 128, 128]);
    const kpsTensor = new Tensor("float32", kps.data, [1, 8]);

    return onnxSession.run({ 
      input1: inputTensor1,
      input2: inputTensor2,
      kps: kpsTensor
    });
}

onmessage = async function (e) {
  if (!onnxSession) {
    console.error("[Worker]: Error processing, model not initialized");
    this.postMessage({error: "Model not initialized"})
    return;
  }
  
  try {
    const result = await runInference(e.data.input1, e.data.input2, e.data.kpsTensor)

    postMessage(result);
  } catch (error) {
    console.error("[Worker]: Error processing message", error);
    postMessage({ error: error.message });
  }
};
