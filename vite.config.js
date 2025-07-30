import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm";


export default defineConfig({
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