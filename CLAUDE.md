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
3. **`src/eyetracking.js`** — Video/detection layer: webcam capture, MediaPipe FaceMesh (npm package, runtime assets copied from `node_modules` to `public/mediapipe/` by `vite-plugin-static-copy`), eye landmark extraction, tensor preprocessing, Web Worker communication.
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

## Stale experimental branches

- **`spike/facelandmarker`** — migration from `@mediapipe/face_mesh` (Solutions API, frozen since 2022) to `@mediapipe/tasks-vision` `FaceLandmarker` (the actively-maintained successor). Functional on Chromium but **parked** because:
  1. **Linux/Firefox crash**: `detectForVideo` throws `RuntimeError: index out of bounds` after a few frames. No upstream report or fix as of 2026-05; not reproducible on Chromium.
  2. **Slower in practice**: legacy `face_mesh` ships with an internal Web Worker that runs detection off-thread for free. `@mediapipe/tasks-vision` does not — we have to spin up our own face worker (`src/face-worker.js` on the branch), and even then the per-frame main-thread cost (eye-crop drawImage + getImageData round-trips, postMessage to ONNX worker) is similar to legacy.
  3. **Vite worker quirk**: `tasks-vision`'s WASM-glue loader uses `importScripts`, which only exists in classic workers. In a `type: "module"` worker its loader can't expose `ModuleFactory` and init throws "ModuleFactory not set" (upstream issue [`google-ai-edge/mediapipe#5527`](https://github.com/google-ai-edge/mediapipe/issues/5527)). Vite's dev server doesn't bundle classic workers, so the branch builds `face-worker.js` as an IIFE library to `public/tasks-vision/face-worker.js` via a separate `vite.face-worker.config.js`.

  Revisit when (a) Google ships a fix for the Linux/Firefox crash, or (b) we need a tasks-vision-only feature (blendshapes, transformation matrices, etc).
