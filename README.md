# 👁️ Peekr: Browser-based Eye Tracking

![Peekr Welcome Screen](./image/Peekr%20Banner.png)

**Peekr** is a lightweight, browser-compatible webcam eye tracking module.
It runs entirely in the browser — no installation, no data sent to a server.

> [!TIP]
> You can test it on [GitHub Pages](https://hugofara.github.io/peekr/).

[Peekr 1.1.0 demo.webm](https://github.com/user-attachments/assets/4f9a84af-a20f-44a2-82b9-3776c876342e)

## Install

You need to get [Node](https://nodejs.org/en/download) first.

Then clone and enter the folder with:

```sh
git clone https://github.com/HugoFara/peekr.git
cd peekr
npm install
# Build with Vite
npm run dev
```

Under the hood, we are using [Vite](https://vite.dev).
If you only want to generate the website, use `npm run build`.
The output will be in the `dist/` folder.

## 🧪 Usage

A demo should be available at <https://hugofara.github.io/peekr/>.

Start by loading the model ("Init Eye Tracking").
Then, either adjust the calibration values by yourself, or use the "Assisted Calibration" utility.

## 🧠 Structure

You will find the following JS files:

```text
peekr/
├── src/
│   ├── index.js        # Main entry point; handles UI bindings, calibration, and tracking logic
│   ├── core.js         # Core logic for initializing, running, and stopping eye tracking; filtering
│   ├── eyetracking.js  # Handles video input, face mesh, and communication with the worker
│   ├── worker.js       # Web worker for running the ONNX gaze model off the main thread
│   └── style.css       # Demo page styles
├── public/
│   └── peekr.onnx      # Pretrained ONNX model for gaze estimation
├── index.html          # Demo web page with controls and UI
├── package.json        # Project metadata and dependencies
└── README.md           # Documentation and usage instructions
```

### `Peekr.applyAutoBindings({ buttons, inputs, log, gazeDot, calibrationDot })`

Bridges between a standard HTML page and Peekr interactions.

It receives arrays of HTML elements as an input.

### `Peekr.initEyeTracking({ onReady, onGaze })`

Initializes the webcam, loads the ONNX model, and sets up gaze detection.

* `onReady`: Called once the model is loaded and initialized.
* `onGaze(gaze)`: Called every frame with the gaze prediction:

  ```js
  gaze.output.cpuData = [x, y]; // Both values in range ~[0, 1]
  ```

### `Peekr.runEyeTracking()`

Starts real-time gaze prediction.

### `Peekr.stopEyeTracking()`

Stops webcam and gaze processing.

## 🚀 Load via npm

> [!IMPORTANT]
> The `peekr` package on npm is Aryaman's original version, which may differ significantly from this fork.

To install this fork directly from GitHub:

```bash
npm install github:HugoFara/peekr
```

Then:

```js
import * as Peekr from 'peekr';
```

## 🧠 Credits

Built by **Aryaman Taore** at [Dakin Lab](https://www.dakinlab.org) and [Stanford Brain Development & Education Lab](https://edneuro.stanford.edu).

The web part received major changes from [Hugo Fara](https://hugofara.net).
It includes a new calibration set up and a Kalman filtering of the output.

## 🎓 Background

Peekr was developed by **Aryaman Taore**, a visual neuroscientist and machine learning engineer.
The project emerged during Aryaman's PhD at the University of Auckland and continued through his postdoctoral research at **Stanford University**.
Peekr's underlying ML model was trained on **268,000+ image frames** from **264 participants** recruited via [Prolific](https://www.prolific.com/).
Each participant used their own personal setup.

## Performances

**Accuracy** (after calibration):

* Mean horizontal error: **1.53 cm** (~1.75° visual angle)
* Mean vertical error: **2.20 cm** (~2.52° visual angle)

These results were obtained from 30 randomly selected participants using their own setups, with no supervision.
Each participant followed a stimulus on screen after completing a simple 5-dot calibration.
The calibration consisted of four dots in the corners and one in the center of the screen.
After this, a linear fit was applied separately to the x and y axes to adjust the gaze predictions.

## 🗪 License

[MIT](https://mit-license.org/)
