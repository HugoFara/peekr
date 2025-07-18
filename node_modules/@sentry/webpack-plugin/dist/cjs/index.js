'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var webpack4and5 = require('./webpack4and5.js');
var webpack4or5 = require('webpack');
var bundlerPluginCore = require('@sentry/bundler-plugin-core');
require('path');
require('uuid');

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

var webpack4or5__namespace = /*#__PURE__*/_interopNamespace(webpack4or5);

var _webpack4or5$default, _webpack4or5$default2;
var BannerPlugin = (webpack4or5__namespace === null || webpack4or5__namespace === void 0 ? void 0 : webpack4or5__namespace.BannerPlugin) || (webpack4or5__namespace === null || webpack4or5__namespace === void 0 ? void 0 : (_webpack4or5$default = webpack4or5__namespace["default"]) === null || _webpack4or5$default === void 0 ? void 0 : _webpack4or5$default.BannerPlugin);
var DefinePlugin = (webpack4or5__namespace === null || webpack4or5__namespace === void 0 ? void 0 : webpack4or5__namespace.DefinePlugin) || (webpack4or5__namespace === null || webpack4or5__namespace === void 0 ? void 0 : (_webpack4or5$default2 = webpack4or5__namespace["default"]) === null || _webpack4or5$default2 === void 0 ? void 0 : _webpack4or5$default2.DefinePlugin);
var sentryUnplugin = webpack4and5.sentryWebpackUnpluginFactory({
  BannerPlugin: BannerPlugin,
  DefinePlugin: DefinePlugin
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var sentryWebpackPlugin = sentryUnplugin.webpack;

Object.defineProperty(exports, 'sentryCliBinaryExists', {
  enumerable: true,
  get: function () { return bundlerPluginCore.sentryCliBinaryExists; }
});
exports.sentryWebpackPlugin = sentryWebpackPlugin;
//# sourceMappingURL=index.js.map
