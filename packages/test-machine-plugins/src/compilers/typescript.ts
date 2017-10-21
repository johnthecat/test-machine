import { CompilerPlugin, CompilerSource } from 'test-machine-core/src/interface';
import { noModuleException } from '../utils';

const DEFAULT_FILENAME = 'module';

export function typescriptCompiler(config = {}): CompilerPlugin {
    let typescript: any;

    try {
        typescript = require('typescript');
    } catch (e) {
        throw noModuleException('babel-core');
    }

    return (input: CompilerSource, filename: string = DEFAULT_FILENAME): CompilerSource => {
        if (input.source.length === 0) {
            return input;
        }

        const result = typescript.transpileModule(input.source, {});

        return {
            source: result.outputText,
            sourcemap: result.sourceMapText
        };
    };
}
