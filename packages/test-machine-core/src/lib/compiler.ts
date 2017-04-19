import {TCompiler} from '../interface';
import {Cache} from './cache';

const EMPTY_RESULT = '';
const DEFAULT_FILENAME = 'unknown';

class Compiler {

    private cache: Cache<string> = new Cache<string>(true);

    constructor(private pipeline: Array<TCompiler>) {}

    public compile(source: string, filename: string = DEFAULT_FILENAME): string {
        if (this.cache.has(source)) {
            return this.cache.get(source) || EMPTY_RESULT;
        }

        let result = source;

        for (let index = 0, count = this.pipeline.length; index < count; index++) {
            result = this.pipeline[index](result, filename);
        }

        this.cache.set(source, result);

        return result;
    }

    public push(compiler: TCompiler): void {
        this.pipeline.push(compiler);
    }
}

export {Compiler};
