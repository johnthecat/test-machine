import { ICompilerSource, TCompilerPlugin } from '../interface';
import { Collection } from './collection';

const DEFAULT_FILENAME = 'unknown';

class Compiler {

    private cache: Collection<ICompilerSource> = new Collection(true);

    constructor(private pipeline: Array<TCompilerPlugin>) {
    }

    public compile(source: string, filename: string = DEFAULT_FILENAME): string {
        if (this.cache.has(source)) {
            const cachedSource = this.cache.get(source);

            if (cachedSource) {
                return cachedSource.source;
            }
        }

        let result: ICompilerSource = {
            source,
            sourcemap: null
        };
        let compiler: TCompilerPlugin;

        for (let index = 0, count = this.pipeline.length; index < count; index++) {
            compiler = this.pipeline[index];

            Object.assign(result, compiler(result, filename));
        }

        this.cache.set(source, result);

        return result.source;
    }

    public push(compiler: TCompilerPlugin): void {
        this.pipeline.push(compiler);
        this.cache.clear();
    }
}

export { Compiler };
