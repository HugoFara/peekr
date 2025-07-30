# Contributing to Peekr

You can contribute to Peekr in various ways.

## New version

Bump the version number in `package.json`, as well as in `index.html`.
Then, commit and add a new tag with the version.

## 📦 Publishing

To build and publish:

```bash
npm run build
npm publish --access public
```

Make sure your `dist/` includes the model, worker, and all necessary WASM files.
