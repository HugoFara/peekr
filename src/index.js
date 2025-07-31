/*
 * Main entry point; handles UI bindings, calibration, and tracking logic
 */
import { runEyeTracking, applyFilter, initEyeTracking, stopEyeTracking } from "./core";

// Model distance constants (in cm)
const MODEL_DIST_X = -270;
const MODEL_DIST_Y = 350;

/**
 * Calculate the coefficients for the linear model based on the distance to screen.
 * 
 * @param {number} distToScreen - The distance to the screen in cm.
 * @returns {Object} An object containing the coefficients for the linear model.
 */
export function calculateCoefficients(distToScreen) {
  const coef_x = MODEL_DIST_X / distToScreen;
  const coef_y = MODEL_DIST_Y / distToScreen;
  return { coef_x, coef_y };
}

export function moveCalibratedDot(rawX, rawY, distToScreen, x_intercept, y_intercept) {
  // Calculate coefficients based on distance
  const { coef_x, coef_y } = calculateCoefficients(distToScreen);
  const xpred = (coef_x * (rawX - 0.5) + x_intercept) * screen.width;
  const ypred = (coef_y * rawY + y_intercept) * screen.height;

  return [ xpred, ypred ];
}

function createEyeTrackingElements() {
  // Create video element
  if (!domElements.video) {
    domElements.video = document.createElement("video");
    domElements.video.className = "inputVideo";
    domElements.video.autoplay = true;
    domElements.video.playsInline = true;
    domElements.video.style.display = "none";
    document.body.appendChild(domElements.video);
  }

  // Create canvas element
  if (!domElements.canvas) {
    domElements.canvas = document.createElement("canvas");
    domElements.canvas.id = "headCanvas";
    domElements.canvas.style.display = "none";
    document.body.appendChild(domElements.canvas);
  }

  // Create left eye canvas
  if (!domElements.leftEyeCanvas) {
    domElements.leftEyeCanvas = document.createElement("canvas");
    domElements.leftEyeCanvas.width = 128;
    domElements.leftEyeCanvas.height = 128;
    domElements.leftEyeCanvas.style.display = "none";
    document.body.appendChild(domElements.leftEyeCanvas);
  }

  // Create right eye canvas
  if (!domElements.rightEyeCanvas) {
    domElements.rightEyeCanvas = document.createElement("canvas");
    domElements.rightEyeCanvas.width = 128;
    domElements.rightEyeCanvas.height = 128;
    domElements.rightEyeCanvas.style.display = "none";
    document.body.appendChild(domElements.rightEyeCanvas);
  }

  return {
    video: domElements.video,
    canvas: domElements.canvas,
    leftEyeCanvas: domElements.leftEyeCanvas,
    rightEyeCanvas: domElements.rightEyeCanvas,
  };
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
    xInterceptInput: undefined,
    yInterceptInput: undefined,
  },
  log: undefined,
  gazeDot: undefined,
  calibrationDot: undefined,
  // Eye tracking elements
  video: undefined,
  canvas: undefined,
  leftEyeCanvas: undefined,
  rightEyeCanvas: undefined,
};

// Assisted Calibration Logic
const calibrationLogic = {
  calibrationInProgress: false,
  calibrationStep: 0,
  calibrationGazeData: [],
  calibrationDotReady: false,
  calibrationCorners: [
    { x: 0.1, y: 0.1 }, // top-left
    { x: 0.9, y: 0.1 }, // top-right
    { x: 0.9, y: 0.9 }, // bottom-right
    { x: 0.1, y: 0.9 }  // bottom-left
  ],
  calibrationGazeListener: () => {}
};



export function startAssistedCalibration() {
  if (calibrationLogic.calibrationInProgress) return;

  runEyeTracking();

  calibrationLogic.calibrationInProgress = true;
  calibrationLogic.calibrationStep = 0;
  calibrationLogic.calibrationGazeData = [];
  showCalibrationDot();
  document.getElementById("PeekrLog").textContent += "\n🔵 Assisted calibration started. Follow the blue dot.";
  // Temporarily override onGaze
  calibrationLogic.calibrationGazeListener = (gaze) => {
    // Wait a short time at each corner, then record gaze
    if (calibrationLogic.calibrationStep < calibrationLogic.calibrationCorners.length) {
      // Only record after a short delay to let user focus
      if (!calibrationLogic.calibrationDotReady) return;
      const gazePos = {
        rawX: gaze.output.cpuData[0],
        rawY: gaze.output.cpuData[1]
      };
      if (document.getElementById("PeekrFiltering").checked) {
        [ gazePos.rawX, gazePos.rawY ] = applyFilter(gazePos.rawX, gazePos.rawY)
      }
      calibrationLogic.calibrationGazeData.push({
        rawX: gaze.output.cpuData[0],
        rawY: gaze.output.cpuData[1]
      });
      calibrationLogic.calibrationStep++;
      if (calibrationLogic.calibrationStep < calibrationLogic.calibrationCorners.length) {
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
  const corner = calibrationLogic.calibrationCorners[calibrationLogic.calibrationStep];
  domElements.calibrationDot.style.left = `calc(${corner.x * 100}% - 15px)`;
  domElements.calibrationDot.style.top = `calc(${corner.y * 100}% - 15px)`;
  domElements.calibrationDot.style.display = 'block';
  calibrationLogic.calibrationDotReady = false;
  setTimeout(() => {
    calibrationLogic.calibrationDotReady = true;
  }, 1000); // 1s for user to focus
}

function finishAssistedCalibration() {
  domElements.calibrationDot.style.display = 'none';
  calibrationLogic.calibrationGazeListener = () => {};
  calibrationLogic.calibrationInProgress = false;
  
  // Get current distance to screen as initial guess
  let distToScreen = parseFloat(domElements.inputs.distInput.value) || 60;
  
  // Try multiple starting distances to avoid local minima
  const startingDistances = [distToScreen, 40, 80, 120];
  
  // Calculate mean gaze values for each corner
  const meanGazeX = calibrationLogic.calibrationGazeData.map(d => d.rawX);
  const meanGazeY = calibrationLogic.calibrationGazeData.map(d => d.rawY);
  
  // Calculate expected screen positions for each corner
  const expectedScreenX = [0, 1, 1, 0]; // [TL, TR, BR, BL]
  const expectedScreenY = [0, 0, 1, 1]; // [TL, TR, BR, BL]
  
  // Function to calculate error for given parameters
  function calculateError(params) {
    const { distToScreen, xIntercept, yIntercept } = params;
    const { coef_x, coef_y } = calculateCoefficients(distToScreen);
    
    let totalError = 0;
    
    for (let i = 0; i < meanGazeX.length; i++) {
      // Calculate predicted screen positions
      const predictedX = coef_x * (meanGazeX[i] - 0.5) + xIntercept;
      const predictedY = coef_y * meanGazeY[i] + yIntercept;
      
      // Calculate squared error
      const errorX = Math.pow(predictedX - expectedScreenX[i], 2);
      const errorY = Math.pow(predictedY - expectedScreenY[i], 2);
      
      totalError += errorX + errorY;
    }
    
    return totalError;
  }
  
  // Multi-start optimization to avoid local minima
  let globalBestParams = null;
  let globalBestError = Infinity;
  
  for (const startDist of startingDistances) {
    // Improved gradient descent with adaptive learning rates
    const iterations = 1000;
    const tolerance = 1e-8;
    
    let currentParams = {
      distToScreen: startDist,
      xIntercept: 0,
      yIntercept: 0
    };
    
    let currentError = calculateError(currentParams);
    let bestParams = { ...currentParams };
    let bestError = currentError;
    
    // Adaptive learning rates for different parameters
    const distLearningRate = 0.5;  // Larger for distance
    const interceptLearningRate = 0.1;  // Smaller for intercepts
    
    for (let iter = 0; iter < iterations; iter++) {
      const prevError = currentError;
      
      // Calculate gradients using finite differences
      const distDelta = 1.0;  // Larger delta for distance
      const interceptDelta = 0.01;  // Smaller delta for intercepts
      
      // Gradient for distToScreen
      const distGradient = (calculateError({
        ...currentParams,
        distToScreen: currentParams.distToScreen + distDelta
      }) - currentError) / distDelta;
      
      // Gradient for xIntercept
      const xInterceptGradient = (calculateError({
        ...currentParams,
        xIntercept: currentParams.xIntercept + interceptDelta
      }) - currentError) / interceptDelta;
      
      // Gradient for yIntercept
      const yInterceptGradient = (calculateError({
        ...currentParams,
        yIntercept: currentParams.yIntercept + interceptDelta
      }) - currentError) / interceptDelta;
      
      // Update parameters with different learning rates
      const newDistToScreen = currentParams.distToScreen - distLearningRate * distGradient;
      const newXIntercept = currentParams.xIntercept - interceptLearningRate * xInterceptGradient;
      const newYIntercept = currentParams.yIntercept - interceptLearningRate * yInterceptGradient;
      
      // Ensure distance is within reasonable bounds
      currentParams.distToScreen = Math.max(20, Math.min(200, newDistToScreen));
      currentParams.xIntercept = newXIntercept;
      currentParams.yIntercept = newYIntercept;
      
      currentError = calculateError(currentParams);
      
      // Keep track of best parameters
      if (currentError < bestError) {
        bestError = currentError;
        bestParams = { ...currentParams };
      }
      
      // Check for convergence
      if (Math.abs(currentError - prevError) < tolerance) {
        break;
      }
      
      // Early stopping if error is very small
      if (currentError < 1e-6) {
        break;
      }
    }
    
    // Update global best if this run was better
    if (bestError < globalBestError) {
      globalBestError = bestError;
      globalBestParams = { ...bestParams };
    }
  }
  
  // Use the globally best parameters found
  const currentParams = globalBestParams;
  
  // Update UI with optimized parameters
  domElements.inputs.distInput.value = currentParams.distToScreen.toFixed(1);
  domElements.inputs.xInterceptInput.value = (currentParams.xIntercept * 100).toFixed(0);
  domElements.inputs.yInterceptInput.value = (currentParams.yIntercept * 100).toFixed(0);
  
  // Calculate final error for debugging
  const finalError = calculateError(currentParams);
  const initialError = calculateError({ distToScreen: distToScreen, xIntercept: 0, yIntercept: 0 });
  
  domElements.log.textContent += `\n✅ Assisted calibration complete.`;
  domElements.log.textContent += `\n📊 Initial error: ${initialError.toFixed(6)}, Final error: ${finalError.toFixed(6)}`;
  domElements.log.textContent += `\n📏 Optimized distance: ${currentParams.distToScreen.toFixed(1)}cm`;
  domElements.log.textContent += `\n📍 X intercept: ${(currentParams.xIntercept * 100).toFixed(0)}, Y intercept: ${(currentParams.yIntercept * 100).toFixed(0)}`;
}


export function startEyeTrackingWithCallbacks() {
  domElements.buttons.initBtn.disabled = true;
  const dot = domElements.gazeDot;
  const logEl = domElements.log;

  // Create eye tracking elements
  const eyeElements = createEyeTrackingElements();

  initEyeTracking({
    video: eyeElements.video,
    canvas: eyeElements.canvas,
    leftEyeCanvas: eyeElements.leftEyeCanvas,
    rightEyeCanvas: eyeElements.rightEyeCanvas,
    onReady: () => {
      logEl.textContent += "\n✅ Model Loaded. Run Eye Tracking Now.";
      // Enable buttons
      domElements.buttons.startBtn.disabled = false;
      domElements.buttons.stopBtn.disabled = false;
      domElements.buttons.calibBtn.disabled = false;

      dot.style.display = "block";
    },
    onGaze: (gaze) => {
      if (calibrationLogic.calibrationInProgress) {
        calibrationLogic.calibrationGazeListener(gaze);
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
    domElements.inputs.xInterceptInput = inputs.xInterceptInput;
    domElements.inputs.yInterceptInput = inputs.yInterceptInput;
  }
  else {
    domElements.inputs.distInput = document.getElementById("PeekrDistInput");
    domElements.inputs.xInterceptInput = document.getElementById("PeekrXInterceptInput");
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
  
  // Distance input is now only used for coefficient calculation during calibration
  // No need to update any display since coefficients are calculated dynamically
};
