# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The tracking dot is now green when in-screen, red when out screen.
- The X and Y coefficients were merged in a "distance to screen" parameter.

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
