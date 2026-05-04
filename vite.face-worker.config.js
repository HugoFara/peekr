/*
 * Build face-worker.js as a single IIFE classic-script.
 *
 * Vite's dev server doesn't bundle classic workers (see comment in
 * src/eyetracking.js). We bypass that by treating face-worker.js as
 * a small library and emitting it to public/tasks-vision/, where it
 * is served as a static asset and loaded by a plain
 * `new Worker(url)` call.
 *
 * Run via `npm run build:face-worker`. Hooked into `predev`/`prebuild`.
 */
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: 'src/face-worker.js',
      formats: ['iife'],
      name: 'PeekrFaceWorker',
      fileName: () => 'face-worker.js',
    },
    outDir: 'public/tasks-vision',
    emptyOutDir: false,
    minify: true,
  },
});
