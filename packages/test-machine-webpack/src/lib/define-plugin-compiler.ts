import {IDefinePlugin} from '../interface';
import {TCompiler} from 'test-machine-core/src/interface';

const defaultCompiler = (source: string): string => source;

export const definePluginCompilerFactory = (plugin: IDefinePlugin): TCompiler => {
    if (!plugin) {
        return defaultCompiler;
    }

    const declarations = plugin.definitions;
    const keys = Object.keys(declarations);
    const regExps = keys.map((key) => new RegExp(`(\\W)?${key}(\\W)?`, 'gm'));
    const count = keys.length;

    let tmp: string;

    return (source: string): string => {
        tmp = source;

        for (let index = 0; index < count; index++) {
            tmp = tmp.replace(regExps[index], '$1' + declarations[keys[index]] + '$2');
        }

        return tmp;
    };
};
