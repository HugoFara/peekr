'use strict';

var bundlerPluginCore = require('@sentry/bundler-plugin-core');
var path = require('path');
var uuid = require('uuid');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

// since webpack 5.1 compiler contains webpack module so plugins always use correct webpack version
// https://github.com/webpack/webpack/commit/65eca2e529ce1d79b79200d4bdb1ce1b81141459
function webpackReleaseInjectionPlugin(UnsafeBannerPlugin) {
  return function (injectionCode) {
    return {
      name: "sentry-webpack-release-injection-plugin",
      webpack: function webpack(compiler) {
        var _compiler$webpack;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        var BannerPlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (compiler === null || compiler === void 0 ? void 0 : (_compiler$webpack = compiler.webpack) === null || _compiler$webpack === void 0 ? void 0 : _compiler$webpack.BannerPlugin) || UnsafeBannerPlugin;
        compiler.options.plugins = compiler.options.plugins || [];
        compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)(\?[^?]*)?(#[^#]*)?$/,
          banner: injectionCode
        }));
      }
    };
  };
}
function webpackComponentNameAnnotatePlugin() {
  return function (ignoredComponents) {
    return {
      name: "sentry-webpack-component-name-annotate-plugin",
      enforce: "pre",
      // Webpack needs this hook for loader logic, so the plugin is not run on unsupported file types
      transformInclude: function transformInclude(id) {
        return id.endsWith(".tsx") || id.endsWith(".jsx");
      },
      transform: bundlerPluginCore.createComponentNameAnnotateHooks(ignoredComponents).transform
    };
  };
}
function webpackBundleSizeOptimizationsPlugin(UnsafeDefinePlugin) {
  return function (replacementValues) {
    return {
      name: "sentry-webpack-bundle-size-optimizations-plugin",
      webpack: function webpack(compiler) {
        var _compiler$webpack2;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        var DefinePlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (compiler === null || compiler === void 0 ? void 0 : (_compiler$webpack2 = compiler.webpack) === null || _compiler$webpack2 === void 0 ? void 0 : _compiler$webpack2.DefinePlugin) || UnsafeDefinePlugin;
        compiler.options.plugins = compiler.options.plugins || [];
        compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new DefinePlugin(_objectSpread2({}, replacementValues)));
      }
    };
  };
}
function webpackDebugIdInjectionPlugin(UnsafeBannerPlugin) {
  return function () {
    return {
      name: "sentry-webpack-debug-id-injection-plugin",
      webpack: function webpack(compiler) {
        var _compiler$webpack3;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        var BannerPlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (compiler === null || compiler === void 0 ? void 0 : (_compiler$webpack3 = compiler.webpack) === null || _compiler$webpack3 === void 0 ? void 0 : _compiler$webpack3.BannerPlugin) || UnsafeBannerPlugin;
        compiler.options.plugins = compiler.options.plugins || [];
        compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)(\?[^?]*)?(#[^#]*)?$/,
          banner: function banner(arg) {
            var _arg$chunk$contentHas, _arg$chunk, _arg$chunk$contentHas2, _arg$chunk2;
            var hash = (_arg$chunk$contentHas = arg === null || arg === void 0 ? void 0 : (_arg$chunk = arg.chunk) === null || _arg$chunk === void 0 ? void 0 : (_arg$chunk$contentHas2 = _arg$chunk.contentHash) === null || _arg$chunk$contentHas2 === void 0 ? void 0 : _arg$chunk$contentHas2.javascript) !== null && _arg$chunk$contentHas !== void 0 ? _arg$chunk$contentHas : arg === null || arg === void 0 ? void 0 : (_arg$chunk2 = arg.chunk) === null || _arg$chunk2 === void 0 ? void 0 : _arg$chunk2.hash;
            var debugId = hash ? bundlerPluginCore.stringToUUID(hash) : uuid.v4();
            return bundlerPluginCore.getDebugIdSnippet(debugId);
          }
        }));
      }
    };
  };
}
function webpackDebugIdUploadPlugin(upload, logger, createDependencyOnBuildArtifacts, forceExitOnBuildCompletion) {
  var pluginName = "sentry-webpack-debug-id-upload-plugin";
  return {
    name: pluginName,
    webpack: function webpack(compiler) {
      var freeGlobalDependencyOnDebugIdSourcemapArtifacts = createDependencyOnBuildArtifacts();
      compiler.hooks.afterEmit.tapAsync(pluginName, function (compilation, callback) {
        var _ref;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        var outputPath = (_ref = compilation.outputOptions.path) !== null && _ref !== void 0 ? _ref : path__namespace.resolve();
        var buildArtifacts = Object.keys(compilation.assets).map(function (asset) {
          return path__namespace.join(outputPath, asset);
        });
        void upload(buildArtifacts).then(function () {
          callback();
        })["finally"](function () {
          freeGlobalDependencyOnDebugIdSourcemapArtifacts();
        });
      });
      if (forceExitOnBuildCompletion && compiler.options.mode === "production") {
        compiler.hooks.done.tap(pluginName, function () {
          setTimeout(function () {
            logger.debug("Exiting process after debug file upload");
            process.exit(0);
          });
        });
      }
    }
  };
}
function webpackModuleMetadataInjectionPlugin(UnsafeBannerPlugin) {
  return function (injectionCode) {
    return {
      name: "sentry-webpack-module-metadata-injection-plugin",
      webpack: function webpack(compiler) {
        var _compiler$webpack4;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        var BannerPlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (compiler === null || compiler === void 0 ? void 0 : (_compiler$webpack4 = compiler.webpack) === null || _compiler$webpack4 === void 0 ? void 0 : _compiler$webpack4.BannerPlugin) || UnsafeBannerPlugin;
        compiler.options.plugins = compiler.options.plugins || [];
        compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)(\?[^?]*)?(#[^#]*)?$/,
          banner: injectionCode
        }));
      }
    };
  };
}

/**
 * The factory function accepts BannerPlugin and DefinePlugin classes in
 * order to avoid direct dependencies on webpack.
 *
 * This allow us to export version of the plugin for webpack 5.1+ and compatible environments.
 *
 * Since webpack 5.1 compiler contains webpack module so plugins always use correct webpack version.
 */
function sentryWebpackUnpluginFactory() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    BannerPlugin = _ref2.BannerPlugin,
    DefinePlugin = _ref2.DefinePlugin;
  return bundlerPluginCore.sentryUnpluginFactory({
    releaseInjectionPlugin: webpackReleaseInjectionPlugin(BannerPlugin),
    componentNameAnnotatePlugin: webpackComponentNameAnnotatePlugin(),
    moduleMetadataInjectionPlugin: webpackModuleMetadataInjectionPlugin(BannerPlugin),
    debugIdInjectionPlugin: webpackDebugIdInjectionPlugin(BannerPlugin),
    debugIdUploadPlugin: webpackDebugIdUploadPlugin,
    bundleSizeOptimizationsPlugin: webpackBundleSizeOptimizationsPlugin(DefinePlugin)
  });
}

exports.sentryWebpackUnpluginFactory = sentryWebpackUnpluginFactory;
//# sourceMappingURL=webpack4and5.js.map
