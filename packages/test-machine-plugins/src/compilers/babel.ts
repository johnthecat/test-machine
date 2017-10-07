import { CompilerPlugin, CompilerSource } from 'test-machine-core/src/interface';
import { noModuleException } from '../utils';

const DEFAULT_FILENAME = 'webpack-module';

export function babelCompiler(config = {}): CompilerPlugin {
    let babel: any;

    try {
        babel = require('babel-core');
    } catch (e) {
        throw noModuleException('babel-core');
    }

    return (input: CompilerSource, filename: string = DEFAULT_FILENAME): CompilerSource => {
        if (input.source.length === 0) {
            return input;
        }

        const result = babel.transform(
            input.source,
            Object.assign({
                filename,
                inputSourceMap: input.sourcemap
            }, config)
        );

        return {
            source: result.code,
            sourcemap: result.map
        };
    };
}
