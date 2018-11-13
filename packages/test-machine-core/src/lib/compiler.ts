import { CompilerSource, CompilerPlugin } from 'test-machine-interfaces';
import { Collection } from './collection';

/**
 * Compiler is a simple module for passing source code through pipeline of compiler plugins.
 * Compiler plugin works alike loader in webpack - in gets source and sourcemap
 * and returns new source and sourcemap, and so on.
 */

const DEFAULT_FILENAME = 'unknown';

class Compiler {

    private cache: Collection<CompilerSource> = new Collection(true);

    constructor(private pipeline: Array<CompilerPlugin>) {}

    public compile(source: string, filename: string = DEFAULT_FILENAME): CompilerSource {
        if (this.cache.has(source)) {
            const cachedSource = this.cache.get(source);

            if (cachedSource) {
                return cachedSource;
            }
        }

        const pipeline = this.pipeline;

        let compiler: CompilerPlugin;
        let compilationResult: CompilerSource;
        let result: CompilerSource = {
            source
        };

        for (let index = 0; index < pipeline.length; index++) {
            compiler = pipeline[index];
            compilationResult = compiler(result, filename);

            if (
                compilationResult &&
                typeof compilationResult.source === 'string'
            ) {
                Object.assign(result, compilationResult);
            }
        }

        this.cache.set(source, result);

        return result;
    }

    public push(compiler: CompilerPlugin): void {
        this.pipeline.push(compiler);
        this.cache.clear();
    }
}

export { Compiler };
