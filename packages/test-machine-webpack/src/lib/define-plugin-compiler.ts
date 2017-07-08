import { TCompilerPlugin, ICompilerSource } from 'test-machine-core/src/interface';
import { compiler } from 'test-machine-plugins';

const defaultCompiler = ({ source }: ICompilerSource): ICompilerSource => ({ source });

export const definePluginCompilerFactory = (plugin: any): TCompilerPlugin => {
    if (!plugin) {
        return defaultCompiler;
    }

    return compiler.babel({
        plugins: [
            ['transform-define', plugin.definitions]
        ]
    });
};
