# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peekr is a browser-based eye-tracking module combining MediaPipe (face/eye detection), ONNX Runtime Web (ML inference), and Kalman filtering (smoothing). It runs entirely client-side with no backend.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build to `dist/`
- `npm run build-gh` — Build for GitHub Pages (relative paths)
- `npm run lint` — ESLint with auto-fix
- `npm run test` — Run tests via Vitest (all tests in `tests/`)

## Architecture

Four-layer pipeline, each file has a single responsibility:

1. **`src/index.js`** — UI layer: DOM bindings, calibration logic (assisted & manual), gaze recording/CSV export. Public API entry point (`applyAutoBindings`, `startAssistedCalibration`, etc.).
2. **`src/core.js`** — Control layer: `initEyeTracking()`, `runEyeTracking()`, `stopEyeTracking()`, Kalman filter application.
3. **`src/eyetracking.js`** — Video/detection layer: webcam capture, MediaPipe FaceMesh (CDN-loaded), eye landmark extraction, tensor preprocessing, Web Worker communication.
4. **`src/worker.js`** — Inference layer: runs in a Web Worker, loads `public/peekr.onnx` via ONNX Runtime, returns gaze predictions.

Data flows: UI → Core → EyeTracking → Worker (postMessage) → back up the chain.

## Key Conventions

- **Commits**: conventional format `type(scope): description` (types: `feat`, `fix`, `refactor`, `chore`, `doc`, `temp`)
- **Style**: 2-space indentation (ESLint enforced), ES modules throughout
- **Versioning**: bump version in both `package.json` and `index.html`, then tag
- **Publishing**: `npm run build && npm publish --access public` — ensure `dist/` includes model, worker, and WASM files

## Testing

Tests are in `tests/index.test.js` using Vitest. They cover pure functions (`calculateCoefficients`, `moveCalibratedDot`) with edge cases. Run a single test file with `npx vitest run tests/index.test.js`.

## Key Constants

- `MODEL_DIST_X`, `MODEL_DIST_Y` in `src/index.js` — model training distance parameters used in calibration coefficient calculations
- The ONNX model (`public/peekr.onnx`) was trained on 268,000+ frames from 264 participants
