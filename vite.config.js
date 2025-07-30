import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";


export default defineConfig({
  worker: {
    plugins: () => {
      return [
        wasm(),
        topLevelAwait()
      ]
    }
  },
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
});