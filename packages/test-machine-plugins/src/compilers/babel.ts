import {TCompiler} from 'test-machine-core/src/interface';
import {noModuleException} from '../utils';

const DEFAULT_FILENAME = 'webpack-module';

export function babelCompiler(config = {}): TCompiler {
    let babel;

    try {
        babel = require('babel-core');
    } catch (e) {
        throw noModuleException('babel-core');
    }

    return (source: string, filename: string = DEFAULT_FILENAME): string => {
        if (source.length === 0) {
            return source;
        }

        return babel.transform(source, Object.assign({filename}, config)).code;
    };
}
