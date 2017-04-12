import {TCompiler} from '../interface';
import {getHash} from './utils';

const EMPTY_RESULT = '';
const DEFAULT_FILENAME = 'unknown';

class Compiler {

    private cache: Map<string, string> = new Map();

    constructor(private pipeline: Array<TCompiler>) {}

    public compile(source: string, filename: string = DEFAULT_FILENAME): string {
        const hash = getHash(source);

        if (this.cache.has(hash)) {
            return this.cache.get(hash) || EMPTY_RESULT;
        }

        let result = source;

        for (let index = 0, count = this.pipeline.length; index < count; index++) {
            result = this.pipeline[index](result, filename);
        }

        this.cache.set(hash, result);

        return result;
    }

    public push(compiler: TCompiler): void {
        this.pipeline.push(compiler);
    }
}

export {Compiler};