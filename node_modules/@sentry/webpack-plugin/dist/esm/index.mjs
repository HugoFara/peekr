import { s as sentryWebpackUnpluginFactory } from './webpack4and5.mjs';
import * as webpack4or5 from 'webpack';
export { sentryCliBinaryExists } from '@sentry/bundler-plugin-core';
import 'path';
import 'uuid';

var _webpack4or5$default, _webpack4or5$default2;
var BannerPlugin = (webpack4or5 === null || webpack4or5 === void 0 ? void 0 : webpack4or5.BannerPlugin) || (webpack4or5 === null || webpack4or5 === void 0 ? void 0 : (_webpack4or5$default = webpack4or5["default"]) === null || _webpack4or5$default === void 0 ? void 0 : _webpack4or5$default.BannerPlugin);
var DefinePlugin = (webpack4or5 === null || webpack4or5 === void 0 ? void 0 : webpack4or5.DefinePlugin) || (webpack4or5 === null || webpack4or5 === void 0 ? void 0 : (_webpack4or5$default2 = webpack4or5["default"]) === null || _webpack4or5$default2 === void 0 ? void 0 : _webpack4or5$default2.DefinePlugin);
var sentryUnplugin = sentryWebpackUnpluginFactory({
  BannerPlugin: BannerPlugin,
  DefinePlugin: DefinePlugin
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var sentryWebpackPlugin = sentryUnplugin.webpack;

export { sentryWebpackPlugin };
//# sourceMappingURL=index.mjs.map
