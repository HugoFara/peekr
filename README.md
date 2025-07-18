# 👁️ Peekr: Browser-based Eye Tracking

**Peekr** is a lightweight, browser-compatible webcam eye tracking module. It runs entirely in the browser — no installation, no data sent to a server.

---

## 🎓 Background

Peekr was developed by **Aryaman Taore**, a visual neuroscientist and machine learning engineer. The project emerged during Aryaman's PhD at the University of Auckland and continued through his postdoctoral research at **Stanford University**. Peekr's underlying ML model was trained on **268,000+ image frames** from **264 participants** recruited via Prolific. Each participant used their own personal setup.

**Accuracy** (after calibration):

* Mean horizontal error: **1.53 cm** (~1.75° visual angle)
* Mean vertical error: **2.20 cm** (~2.52° visual angle)
These results were obtained from 30 randomly selected participants using their own setups, with no supervision. Each participant followed a stimulus on screen after completing a simple 5-dot calibration. The calibration consisted of four dots in the corners and one in the center of the screen. After this, a linear fit was applied separately to the x and y axes to adjust the gaze predictions.

---

## 🧪 Demo (with Calibration Panel)

I have attached a `public/index.html` demo file. To run this demo, follow these steps:

1. First, build the project by running the following command:

   ```bash
   npm install
   npm run build
   ```

2. Then, run the demo using npx with the following command:

   ```bash
   cd src
   npx http-server .
   ```

---

## 🧠 Available Functions

### `Peekr.initEyeTracking({ onReady, onGaze })`

Initializes the webcam, loads the ONNX model, and sets up gaze detection.

* `onReady`: Called once the model is loaded and initialized.
* `onGaze(gaze)`: Called every frame with the gaze prediction:

  ```js
  gaze.output.cpuData = [x, y]; // Both values in range ~[0, 1]
  ```

---

### `Peekr.runEyeTracking()`

Starts real-time gaze prediction.

---

### `Peekr.stopEyeTracking()`

Stops webcam and gaze processing.

---

## 📁 Files Included

| File          | Purpose                         |
| ------------- | ------------------------------- |
| `index.js`    | Main entry module               |
| `worker.js`   | Off-main-thread gaze processing |
| `peekr.onnx`  | Gaze detection model            |
| `.wasm` files | ONNX Runtime Web WASM backend   |

---

## 🚀 Load via npm

```bash
npm install peekr
```

Then:

```js
import * as Peekr from 'peekr';
```

---

## 📦 Publishing

To build and publish:

```bash
npm run build
npm publish --access public
```

Make sure your `dist/` includes the model, worker, and all necessary WASM files.

---

## 🧠 Credits

Built by **Aryaman Taore** at [Dakin Lab](https://www.dakinlab.org) and [Stanford Brain Development & Education Lab](https://edneuro.stanford.edu).

---

## 🗪 License

[MIT](https://mit-license.org/)
