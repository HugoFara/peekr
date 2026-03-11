# Peekr: Browser-based Eye Tracking

![Peekr Welcome Screen](./image/Peekr%20Banner.png)

**Peekr** is a lightweight, browser-compatible webcam eye tracking module.
It runs entirely in the browser — no installation, no data sent to a server.

> [!TIP]
> You can test it on [GitHub Pages](https://hugofara.github.io/peekr/).

![Peekr 1.2.0 Screenshot](./image/Peekr%201.2.0%20screenshot.png)

[Peekr 1.2.0 demo.webm](./image/Peekr%201.2.0%20demo.webm)

## Install

You need to get [Node](https://nodejs.org/en/download) first.

Then clone and enter the folder with:

```sh
git clone https://github.com/HugoFara/peekr.git
cd peekr
npm install
# Start the dev server
npm run dev
```

Under the hood, we are using [Vite](https://vite.dev).
If you only want to generate the website, use `npm run build`.
The output will be in the `dist/` folder.

## Usage

The demo is available at <https://hugofara.github.io/peekr/>.

The app guides you through 4 steps:

1. **Load Model** — Initialize the eye-tracking model and request camera access.
2. **Start Tracking** — Begin real-time gaze tracking. A green dot follows your eyes.
3. **Calibrate** — Follow a blue dot across 9 screen positions to calibrate gaze accuracy.
4. **Validate** — Look at orange dots to measure prediction error and bias.

After calibration, you can also record gaze data and export it as CSV.

## Structure

```text
peekr/
├── src/
│   ├── index.js        # UI layer: DOM bindings, calibration, validation, gaze recording
│   ├── core.js         # Control layer: init, run, stop eye tracking; Kalman filtering
│   ├── eyetracking.js  # Video/detection layer: webcam, MediaPipe FaceMesh, tensor preprocessing
│   ├── worker.js       # Inference layer: Web Worker running the ONNX gaze model
│   └── style.css       # Demo page styles (stepper UI, status badge, cards)
├── tests/
│   └── index.test.js   # Unit tests (Vitest) for calibration math
├── public/
│   └── peekr.onnx      # Pretrained ONNX model for gaze estimation
├── index.html          # Demo page with 4-step guided onboarding
├── package.json        # Project metadata and dependencies
└── README.md           # This file
```

Data flows: UI → Core → EyeTracking → Worker (postMessage) → back up the chain.

## API

### `Peekr.applyAutoBindings()`

Bridges between a standard HTML page and Peekr interactions.
Automatically discovers DOM elements by their `id` attributes and wires up all button handlers.

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

### `Peekr.startAssistedCalibration()`

Runs the 9-point assisted calibration. Shows blue dots at each position, collects 30 gaze samples per point, and optimizes distance-to-screen and offset parameters via gradient descent.

### `Peekr.startValidation()`

Runs validation against 4 held-out points. Reports per-point error, mean error (in pixels and as % of screen diagonal), and mean directional bias.

## Load via npm

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

## Testing

Run all tests:

```bash
npm run test
```

Tests cover `calculateCoefficients` and `moveCalibratedDot` with edge cases (zero/negative distances, extreme values, floating point precision, different screen resolutions).

## Credits

Built by **Aryaman Taore** at [Dakin Lab](https://www.dakinlab.org) and [Stanford Brain Development & Education Lab](https://edneuro.stanford.edu).

The web part received major changes from [Hugo Fara](https://hugofara.net).
It includes a new calibration setup, validation, gaze recording, and Kalman filtering of the output.

## Background

Peekr was developed by **Aryaman Taore**, a visual neuroscientist and machine learning engineer.
The project emerged during Aryaman's PhD at the University of Auckland and continued through his postdoctoral research at **Stanford University**.
Peekr's underlying ML model was trained on **268,000+ image frames** from **264 participants** recruited via [Prolific](https://www.prolific.com/).
Each participant used their own personal setup.

## Performances

**Accuracy** (after calibration):

* Mean horizontal error: **1.53 cm** (~1.75 visual angle)
* Mean vertical error: **2.20 cm** (~2.52 visual angle)

These results were obtained from 30 randomly selected participants using their own setups, with no supervision.
Each participant followed a stimulus on screen after completing a simple 5-dot calibration.
The calibration consisted of four dots in the corners and one in the center of the screen.
After this, a linear fit was applied separately to the x and y axes to adjust the gaze predictions.

## License

[MIT](https://mit-license.org/)
