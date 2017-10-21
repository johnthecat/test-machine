import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackMerge from 'webpack-merge';
import { fs } from 'test-machine-test-utils';
import { TestMachineWebpack } from '../../src';

const NODE_MODULES = path.resolve('../../node_modules');
const OUTPUT = path.resolve(__dirname, '../', '.tmp');

const fixturesFileResolver = fs.fileResolverFactory(__dirname, '../', 'fixtures');

export const getRoot = (fixture: string, ...paths: Array<string>): string => {
    return fixturesFileResolver(fixture, ...paths);
};

export const getTestRoots = (fixture: string): Array<string> => {
    return [ fixturesFileResolver(fixture, 'test') ];
};

export const configFactory = (fixture: string, plugin: TestMachineWebpack | null, extend: webpack.Configuration = {}): webpack.Configuration => {
    const src = fixturesFileResolver(fixture, 'src');

    return webpackMerge({
        entry: path.join(src, 'index.js'),

        bail: true,

        output: {
            path: OUTPUT,
            filename: `${fixture}.js`
        },

        resolve: {
            extensions: ['.js', '.ts', '.css'],
            modules: [NODE_MODULES, src]
        },

        plugins: plugin ? [
            plugin
        ] : []
    }, extend);
};
