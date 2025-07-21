# Contributing to Peekr

You can contribute to Peekr in various ways.

The main issue currently is the lack of `npm run dev`.
This is due to Vite unable to serve WASM files in dev mode.
You can submit pull request if you have any solution.

## 📦 Publishing

To build and publish:

```bash
npm run build
npm publish --access public
```

Make sure your `dist/` includes the model, worker, and all necessary WASM files.
