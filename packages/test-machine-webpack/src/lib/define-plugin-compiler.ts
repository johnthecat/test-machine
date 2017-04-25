import {TCompiler} from 'test-machine-core/src/interface';
import {compiler} from 'test-machine-plugins';

const defaultCompiler = (source: string): string => source;

export const definePluginCompilerFactory = (plugin: any): TCompiler => {
    if (!plugin) {
        return defaultCompiler;
    }

    return compiler.babel({
        plugins: [
            ['transform-define', plugin.definitions]
        ]
    });
};
