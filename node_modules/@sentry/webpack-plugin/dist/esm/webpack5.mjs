import { s as sentryWebpackUnpluginFactory } from './webpack4and5.mjs';
export { sentryCliBinaryExists } from '@sentry/bundler-plugin-core';
import 'path';
import 'uuid';

var sentryUnplugin = sentryWebpackUnpluginFactory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var sentryWebpackPlugin = sentryUnplugin.webpack;

export { sentryWebpackPlugin };
//# sourceMappingURL=webpack5.mjs.map
