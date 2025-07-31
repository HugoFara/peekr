/*
 * Main entry point; handles UI bindings, calibration, and tracking logic
 */
import { runEyeTracking, applyFilter, initEyeTracking, stopEyeTracking } from "./core";

// Model distance constants (in cm)
const MODEL_DIST_X = -270;
const MODEL_DIST_Y = 350;

function calculateCoefficients(distToScreen) {
  const coef_x = MODEL_DIST_X / distToScreen;
  const coef_y = MODEL_DIST_Y / distToScreen;
  return { coef_x, coef_y };
}

function moveCalibratedDot(rawX, rawY, distToScreen, x_intercept, y_intercept) {
  // Calculate coefficients based on distance
  const { coef_x, coef_y } = calculateCoefficients(distToScreen);
  const xpred = (coef_x * (rawX - 0.5) + x_intercept) * screen.width;
  const ypred = (coef_y * rawY + y_intercept) * screen.height;

  return [ xpred, ypred ];
}

const domElements = {
  buttons: {
    initBtn: undefined,
    startBtn: undefined,
    stopBtn: undefined,
    calibBtn: undefined,
    filtering: undefined,
  },
  inputs: {
    distInput: undefined,
    xCoefInput: undefined,
    xInterceptInput: undefined,
    yCoefInput: undefined,
    yInterceptInput: undefined,
  },
  log: undefined,
  gazeDot: undefined,
  calibrationDot: undefined,
};

// Assisted Calibration Logic
let calibrationInProgress = false;
let calibrationStep = 0;
let calibrationGazeData = [];
let calibrationDotReady = false;
const calibrationCorners = [
  { x: 0.1, y: 0.1 }, // top-left
  { x: 0.9, y: 0.1 }, // top-right
  { x: 0.9, y: 0.9 }, // bottom-right
  { x: 0.1, y: 0.9 }  // bottom-left
];
let calibrationGazeListener = () => {};

export function startAssistedCalibration() {
  if (calibrationInProgress) return;

  runEyeTracking();

  calibrationInProgress = true;
  calibrationStep = 0;
  calibrationGazeData = [];
  showCalibrationDot();
  document.getElementById("PeekrLog").textContent += "\n🔵 Assisted calibration started. Follow the blue dot.";
  // Temporarily override onGaze
  calibrationGazeListener = (gaze) => {
    // Wait a short time at each corner, then record gaze
    if (calibrationStep < calibrationCorners.length) {
      // Only record after a short delay to let user focus
      if (!calibrationDotReady) return;
      const gazePos = {
        rawX: gaze.output.cpuData[0],
        rawY: gaze.output.cpuData[1]
      };
      if (document.getElementById("PeekrFiltering").checked) {
        [ gazePos.rawX, gazePos.rawY ] = applyFilter(gazePos.rawX, gazePos.rawY)
      }
      calibrationGazeData.push({
        rawX: gaze.output.cpuData[0],
        rawY: gaze.output.cpuData[1]
      });
      calibrationStep++;
      if (calibrationStep < calibrationCorners.length) {
        showCalibrationDot();
      } else {
        finishAssistedCalibration();
      }
    }
  };
  showCalibrationDot();
}

function showCalibrationDot() {
  if (!domElements.calibrationDot) {
    domElements.calibrationDot = document.createElement('div');
    domElements.calibrationDot.style.position = 'fixed';
    domElements.calibrationDot.style.width = '30px';
    domElements.calibrationDot.style.height = '30px';
    domElements.calibrationDot.style.background = 'blue';
    domElements.calibrationDot.style.borderRadius = '50%';
    domElements.calibrationDot.style.zIndex = 10000;
    domElements.calibrationDot.style.pointerEvents = 'none';
    document.body.appendChild(domElements.calibrationDot);
  }
  const corner = calibrationCorners[calibrationStep];
  domElements.calibrationDot.style.left = `calc(${corner.x * 100}% - 15px)`;
  domElements.calibrationDot.style.top = `calc(${corner.y * 100}% - 15px)`;
  domElements.calibrationDot.style.display = 'block';
  calibrationDotReady = false;
  setTimeout(() => {
    calibrationDotReady = true;
  }, 1000); // 1s for user to focus
}

function finishAssistedCalibration() {
  domElements.calibrationDot.style.display = 'none';
  calibrationGazeListener = () => {};
  calibrationInProgress = false;
  // Compute calibration coefficients
  // Corners: [TL, TR, BR, BL]
  // Screen X: [0, 1, 1, 0], Y: [0, 0, 1, 1]
  // Gaze: calibrationGazeData[i].rawX, rawY
  // Linear fit: x_screen = a * (rawX - 0.5) + b
  //             y_screen = c * rawY + d
  // Use least squares for a, b, c, d
  const X = calibrationGazeData.map(d => d.rawX - 0.5);
  const Y = calibrationGazeData.map(d => d.rawY);
  const x_screen = [0, 1, 1, 0];
  const y_screen = [0, 0, 1, 1];
  // Solve for x: x_screen = a * X + b
  const a = (x_screen[1] - x_screen[0] + x_screen[2] - x_screen[3]) / (X[1] - X[0] + X[2] - X[3]);
  const b = x_screen[0] - a * X[0];
  // Solve for y: y_screen = c * Y + d
  const c = (y_screen[2] - y_screen[1] + y_screen[3] - y_screen[0]) / (Y[2] - Y[1] + Y[3] - Y[0]);
  const d = y_screen[0] - c * Y[0];
  // Update UI with calculated intercepts
  domElements.inputs.xInterceptInput.value = (b * 100).toFixed(0);
  domElements.inputs.yInterceptInput.value = (d * 100).toFixed(0);
  
  // Update coefficient display based on current distance
  const distToScreen = parseFloat(domElements.inputs.distInput.value) || 60;
  const { coef_x, coef_y } = calculateCoefficients(distToScreen);
  domElements.inputs.xCoefInput.value = coef_x.toFixed(2);
  domElements.inputs.yCoefInput.value = coef_y.toFixed(2);
  
  domElements.log.textContent += `\n✅ Assisted calibration complete. Intercepts set.`;
}


export function startEyeTrackingWithCallbacks() {
  domElements.buttons.initBtn.disabled = true;
  const dot = domElements.gazeDot;
  const logEl = domElements.log;

  initEyeTracking({
    onReady: () => {
      logEl.textContent += "\n✅ Model Loaded. Run Eye Tracking Now.";
      // Enable buttons
      domElements.buttons.startBtn.disabled = false;
      domElements.buttons.stopBtn.disabled = false;
      domElements.buttons.calibBtn.disabled = false;

      dot.style.display = "block";
    },
    onGaze: (gaze) => {
      if (calibrationInProgress) {
        calibrationGazeListener(gaze);
        return;
      }
      const rawX = gaze.output.cpuData[0];  // range ~ [0,1]
      const rawY = gaze.output.cpuData[1];

      // Read calibration settings
      const distToScreen = parseFloat(domElements.inputs.distInput.value) || 60;
      const x_intercept = parseFloat(domElements.inputs.xInterceptInput.value) || 0;
      const y_intercept = parseFloat(domElements.inputs.yInterceptInput.value) || 0;

      let filteredX, filteredY;

      if (domElements.buttons.filtering.checked)
        [ filteredX, filteredY ] = applyFilter(rawX, rawY);
      else
        [ filteredX, filteredY ] = [ rawX, rawY ];

      let [ xpred, ypred ] = moveCalibratedDot(
        filteredX,
        filteredY,
        distToScreen,
        x_intercept / 100,
        y_intercept / 100
      );

      // Clamp to screen borders and change color if out of bounds
      let clamped = false;
      const dotRadius = 10; // since dot is 20x20px and transform: translate(-10px, -10px)
      const minX = dotRadius;
      const minY = dotRadius;
      const maxX = window.innerWidth - dotRadius;
      const maxY = window.innerHeight - dotRadius;

      if (xpred < minX) { xpred = minX; clamped = true; }
      if (xpred > maxX) { xpred = maxX; clamped = true; }
      if (ypred < minY) { ypred = minY; clamped = true; }
      if (ypred > maxY) { ypred = maxY; clamped = true; }

      dot.style.left = `${xpred}px`;
      dot.style.top = `${ypred}px`;
      dot.style.background = clamped ? 'red' : 'green';
    }
  });
}

/**
 * Apply bindings to HTML elements based on ID.
 * If no arguments are provided, the function will use the default IDs.
 * 
 * @param {Object} buttons - HTML elements for buttons
 * @param {Object} inputs - HTML elements for inputs
 * @param {Object} log - HTML element for log
 * @param {Object} gazeDot - HTML element for gaze dot
 * @param {Object} calibrationDot - HTML element for calibration dot
 */
export const applyAutoBindings = (buttons, inputs, log, gazeDot, calibrationDot) => {
  if (buttons) {
    domElements.buttons.initBtn = buttons.initBtn;
    domElements.buttons.startBtn = buttons.startBtn;
    domElements.buttons.stopBtn = buttons.stopBtn;
    domElements.buttons.calibBtn = buttons.calibBtn;
    domElements.buttons.filtering = buttons.filtering;
  }
  else {
    domElements.buttons.initBtn = document.getElementById("PeekrInitBtn");
    domElements.buttons.startBtn = document.getElementById("PeekrStartBtn");
    domElements.buttons.stopBtn = document.getElementById("PeekrStopBtn");
    domElements.buttons.calibBtn = document.getElementById("PeekrCalibBtn");
    domElements.buttons.filtering = document.getElementById("PeekrFiltering");
  }
  if (inputs) {
    domElements.inputs.distInput = inputs.distInput;
    domElements.inputs.xCoefInput = inputs.xCoefInput;
    domElements.inputs.xInterceptInput = inputs.xInterceptInput;
    domElements.inputs.yCoefInput = inputs.yCoefInput;
    domElements.inputs.yInterceptInput = inputs.yInterceptInput;
  }
  else {
    domElements.inputs.distInput = document.getElementById("PeekrDistInput");
    domElements.inputs.xCoefInput = document.getElementById("PeekrXCoefInput");
    domElements.inputs.xInterceptInput = document.getElementById("PeekrXInterceptInput");
    domElements.inputs.yCoefInput = document.getElementById("PeekrYCoefInput");
    domElements.inputs.yInterceptInput = document.getElementById("PeekrYInterceptInput");
  }
  if (log) {
    domElements.log = log;
  }
  else {
    domElements.log = document.getElementById("PeekrLog");
  }
  if (gazeDot) {
    domElements.gazeDot = gazeDot;
  }
  else {
    domElements.gazeDot = document.getElementById("PeekrGazeDot");
  }
  if (calibrationDot) {
    domElements.calibrationDot = calibrationDot;
  }
  else {
    domElements.calibrationDot = document.getElementById("PeekrCalibrationDot");
  }

  // Set up event listeners
  domElements.buttons.initBtn.onclick = startEyeTrackingWithCallbacks;
  domElements.buttons.startBtn.onclick = runEyeTracking;
  domElements.buttons.stopBtn.onclick = stopEyeTracking;
  domElements.buttons.calibBtn.onclick = startAssistedCalibration;
  
  // Update coefficient display when distance changes
  domElements.inputs.distInput.oninput = () => {
    const distToScreen = parseFloat(domElements.inputs.distInput.value) || 60;
    const { coef_x, coef_y } = calculateCoefficients(distToScreen);
    domElements.inputs.xCoefInput.value = coef_x.toFixed(2);
    domElements.inputs.yCoefInput.value = coef_y.toFixed(2);
  };
  
  // Initialize coefficient display
  domElements.inputs.distInput.dispatchEvent(new Event('input'));
};
