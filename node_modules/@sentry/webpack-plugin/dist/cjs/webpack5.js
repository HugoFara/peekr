'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var webpack4and5 = require('./webpack4and5.js');
var bundlerPluginCore = require('@sentry/bundler-plugin-core');
require('path');
require('uuid');

var sentryUnplugin = webpack4and5.sentryWebpackUnpluginFactory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var sentryWebpackPlugin = sentryUnplugin.webpack;

Object.defineProperty(exports, 'sentryCliBinaryExists', {
  enumerable: true,
  get: function () { return bundlerPluginCore.sentryCliBinaryExists; }
});
exports.sentryWebpackPlugin = sentryWebpackPlugin;
//# sourceMappingURL=webpack5.js.map
