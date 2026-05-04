# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2026-05-04

### Changed in 1.2.1

- Upgraded major dev dependencies: `eslint` 9 → 10, `vitest` 3 → 4, `globals` 16 → 17, `vite` 7 → 8.
- Upgraded `onnxruntime-web` 1.22 → 1.25.
- Bumped semver-compatible dependencies: `@stylistic/eslint-plugin` 5.2 → 5.10, `vite-plugin-wasm` 3.5 → 3.6.
- Build now copies MediaPipe FaceMesh runtime assets (~17 MB of WASM, asset-data, and JS glue) from `node_modules/@mediapipe/face_mesh/` at dev/build time via `vite-plugin-static-copy`. The corresponding `public/mediapipe/` directory is no longer tracked in git.
- README credits UNIGE and NCCR Evolving Language alongside the Stanford / Dakin Lab origin, with a logo row at the top.

### Fixed in 1.2.1

- ESLint no longer reformats vendored MediaPipe glue under `public/`: scoped `@stylistic/indent` to `src/` and added `public/` and `dist/` to the global ignores.
- Dev mode `SyntaxError: doesn't provide an export named: 'default'` on `@mediapipe/face_mesh`: the package declares `"sideEffects": []`, which causes Vite/rolldown to tree-shake the bare ES import and to fail CJS interop on the optimized bundle. Load `face_mesh.js` as a classic `<script>` tag in `index.html` instead and read `FaceMesh` from `globalThis`.

## [1.2.0] - 2026-03-11

### Added in 1.2.0

- Guided stepper UI: 4-step onboarding flow (Load Model, Start Tracking, Calibrate, Validate) with status badge.
- Validation step: measures prediction accuracy and bias against held-out points after calibration.
- 9-point calibration grid (3x3) with 30 averaged samples per point for robust parameter fitting.
- Multi-start gradient descent optimizer for calibration (distance, x_intercept, y_intercept).
- Gaze recording panel: record gaze data and export as CSV.
- Unit tests for `calculateCoefficients` and `moveCalibratedDot` (18 tests via Vitest).

### Changed in 1.2.0

- The tracking dot is now green when in-screen, red when out of screen.
- The X and Y coefficients were merged into a single "distance to screen" parameter.
- Complete CSS rewrite: card-based layout, step indicators, color-coded status badge, dark-themed log.
- Improved calibration algorithm with better MSE fitting.
- DOM layer cleanly separated from core logic (`src/index.js` handles UI, `src/core.js` handles control).

### Fixed in 1.2.0

- Reverted experimental model constants to correct values (MODEL_DIST_X = -270, MODEL_DIST_Y = 350).
- Kalman-filtered values are now used during calibration when filtering is enabled.

## [1.1.0] - 2025-07-30

### Added in 1.1.0

- Assisted calibration to set calibration parameters easily.
- Cleaner [README.md](./README.md) to build the app.
- Changed rollup configuration to run the app in one command.
- If the dot goes outside of screen, display in blue.
- Adds a favicon.ico.
- Adds an automated build & deployment to GitHub pages.
- Adds two 1-D Kalman filters to improve stability.
- Adds version number to the top page.

### Changed in 1.1.0

- The UI code is now part of the module.
- Switch from Rollup to Vite.
- Total rewrite of the Rollup configuration.
- Updated deprecated code and packages.
- Updated node modules.

### Fixed in 1.1.0

- All gitignored files were removed from the cache.
- Code clean-up and linting.
- `npm run dev` was unavailable (see [HugoFara/peekr#1](https://github.com/HugoFara/peekr/issues/1)).

### Removed in 1.1.0

- Many unnecessary dev dependencies.

## [1.0.5] - 2025-07-18

- Added: project regeneration & clean-up.

## [1.0.4] - 2025-07-18

- Changed: Refactored build process to build to the correct location.
- Removed: deprecated files.

## [1.0.3] - 2025-07-18

- Fixed: fixed worker URL.

## [1.0.2] - 2025-07-18

- Fixed: wrong worker URL.

## [1.0.1] - 2025-07-18

- Changed: the roll-up configuration.

## [1.0.0] - 2025-07-18

- Added: Initial functional state for the app.
