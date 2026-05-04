import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm";
import { viteStaticCopy } from "vite-plugin-static-copy";


export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@mediapipe/tasks-vision/wasm/*",
          dest: "tasks-vision/wasm",
          rename: { stripBase: 4 },
        },
      ],
    }),
  ],
  worker: {
    plugins: () => {
      return [
        wasm(),
      ]
    }
  },
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
});
