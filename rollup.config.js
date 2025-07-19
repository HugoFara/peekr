import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';
import wasm from '@rollup/plugin-wasm';
import OMT from "@surma/rollup-plugin-off-main-thread";
import bundleWorker from 'rollup-plugin-bundle-worker';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'es', 
    name: 'Peekr',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    OMT(),
    wasm(),
    bundleWorker(),
    url({
      include: ['**/*.wasm', '**/*.worker.js'],  // Match both .wasm and .worker.js files      
      limit: 0, // Always emit as separate files
      emitFiles: true,  // Emit the worker script as part of the bundle
    }),
    terser(),
    copy({
      targets: [
        // ✅ Keep model-related files together
        { src: 'public/*', dest: 'dist/' },
        // Necessary to solve dependencies
        { src: 'node_modules/onnxruntime-web/dist/*.wasm', dest: 'dist' },
      ],
      verbose: true,
      hook: 'buildEnd',
    }),
  ],
};
