import { CompilerPlugin, CompilerSource } from 'test-machine-interfaces';
import { compiler } from 'test-machine-plugins';

const defaultCompiler = ({ source }: CompilerSource): CompilerSource => ({ source });

export const definePluginCompilerFactory = (plugin: any): CompilerPlugin => {
    if (!plugin) {
        return defaultCompiler;
    }

    return compiler.babel({
        plugins: [
            ['transform-define', plugin.definitions]
        ]
    });
};
