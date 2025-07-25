import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";


export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  worker: {
    // Not needed with vite-plugin-top-level-await >= 1.3.0
    format: "es",
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