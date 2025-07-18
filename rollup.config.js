import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';
import wasm from '@rollup/plugin-wasm';
import OMT from "@surma/rollup-plugin-off-main-thread";

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
    url({
      include: '**/*.wasm',
      limit: 0, // Always emit as separate files
    }),
    terser(),
    copy({
      targets: [
        // ✅ Keep model-related files together
        { src: 'model/peekr.onnx', dest: 'dist/model' },
        { src: 'node_modules/onnxruntime-web/dist/*.wasm', dest: 'dist' },
        // ✅ Copy worker script
        { src: 'src/worker.js', dest: 'dist' }
      ],
      verbose: true,
      hook: 'buildEnd',
    }),
    
  ],
};
