import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm";
import { viteStaticCopy } from "vite-plugin-static-copy";


export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          // FaceMesh's runtime assets (WASM + binarypb + assets data + their JS
          // glue) are loaded at runtime via `locateFile` and therefore aren't
          // visible to Vite's import graph. Copy them from node_modules into
          // the served root at build/dev time.
          src: "node_modules/@mediapipe/face_mesh/{face_mesh.binarypb,face_mesh_solution_*}",
          dest: "mediapipe",
          rename: { stripBase: 3 },
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
