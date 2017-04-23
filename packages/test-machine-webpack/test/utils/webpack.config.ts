import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackMerge from 'webpack-merge';
import {FIXTURES} from './constants';
import {TestMachineWebpack} from '../../src';

const OUTPUT = path.resolve(__dirname, '../', '.tmp');

export const getTestRoots = (fixture: string): Array<string> => {
    return [
        path.join(FIXTURES, fixture, 'test')
    ];
};

export const configFactory = (fixture: string, plugin: TestMachineWebpack, extend: webpack.Configuration = {}): webpack.Configuration => {
    const src = path.join(FIXTURES, fixture, 'src');

    return webpackMerge({
        entry: path.join(src, 'index.js'),

        output: {
            path: OUTPUT,
            filename: `${fixture}.js`
        },

        resolve: {
            extensions: ['.js', '.ts'],
            modules: [src]
        },

        plugins: [
            plugin
        ]
    }, extend);
};
