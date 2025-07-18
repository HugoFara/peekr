import { Options, sentryUnpluginFactory } from "@sentry/bundler-plugin-core";
type UnsafeBannerPlugin = {
    new (options: any): unknown;
};
type UnsafeDefinePlugin = {
    new (options: any): unknown;
};
/**
 * The factory function accepts BannerPlugin and DefinePlugin classes in
 * order to avoid direct dependencies on webpack.
 *
 * This allow us to export version of the plugin for webpack 5.1+ and compatible environments.
 *
 * Since webpack 5.1 compiler contains webpack module so plugins always use correct webpack version.
 */
export declare function sentryWebpackUnpluginFactory({ BannerPlugin, DefinePlugin, }?: {
    BannerPlugin?: UnsafeBannerPlugin;
    DefinePlugin?: UnsafeDefinePlugin;
}): ReturnType<typeof sentryUnpluginFactory>;
export type SentryWebpackPluginOptions = Options & {
    _experiments?: Options["_experiments"] & {
        /**
         * If enabled, the webpack plugin will exit the build process after the build completes.
         * Use this with caution, as it will terminate the process.
         *
         * More information: https://github.com/getsentry/sentry-javascript-bundler-plugins/issues/345
         *
         * @default false
         */
        forceExitOnBuildCompletion?: boolean;
    };
};
export {};
