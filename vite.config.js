import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm";
import { viteStaticCopy } from "vite-plugin-static-copy";


export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          // FaceMesh ships as a frozen pre-2022 IIFE script that attaches
          // `FaceMesh` to the global object as a side effect. Its
          // package.json declares `"sideEffects": []`, which makes Vite
          // tree-shake any ES `import` of it — and the rolldown CJS interop
          // also fails because the optimized bundle has no exports. So we
          // load face_mesh.js via a classic <script> tag in index.html
          // (referenced as %BASE_URL%mediapipe/face_mesh.js).
          //
          // The runtime assets (WASM + binarypb + asset-data + JS glue) are
          // also loaded at runtime via face_mesh's `locateFile` callback and
          // aren't visible to Vite's import graph either. Copy face_mesh.js
          // and the runtime assets from node_modules into the served root.
          src: "node_modules/@mediapipe/face_mesh/{face_mesh.js,face_mesh.binarypb,face_mesh_solution_*}",
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
