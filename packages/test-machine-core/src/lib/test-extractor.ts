import {TRouter} from '../interface';
import * as path from 'path';
import * as glob from 'glob';
import {Collection} from './collection';

class TestExtractor {

    private globCache = new Collection<string>();

    constructor(private roots: Array<string>, private router: TRouter) {
    }

    public extractTests(changedModules: Array<string>): Array<string> {
        const count = changedModules.length;
        const tests = [];

        for (let index = 0; index < count; index++) {
            this.extractTest(changedModules[index], tests);
        }

        return tests;
    }

    public clearCache(): void {
        this.globCache.clear();
    }

    private getCacheKey(resource: string, root: string, pattern: string): string {
        return resource + root + pattern;
    }

    private getFromCache(resource: string, root: string, pattern: string): string | void {
        return this.globCache.get(this.getCacheKey(resource, root, pattern));
    }

    private pushToCache(resource: string, root: string, pattern: string, value: any): void {
        return this.globCache.set(this.getCacheKey(resource, root, pattern), value);
    }

    private processPattern(resource: string, root: string, pattern: string, tests: Array<string>): void {
        if (typeof pattern !== 'string' || pattern.length === 0) {
            return;
        }

        let cache = this.getFromCache(resource, root, pattern);

        if (cache === void 0) {
            let globResult = glob.sync(pattern, TestExtractor.createGlobConfig(root));
            let newCache = new Array(globResult.length);
            let normalizedPath;

            for (let index = 0; index < globResult.length; index++) {
                normalizedPath = path.resolve(root, globResult[index]);

                newCache[index] = normalizedPath;

                if (tests.includes(normalizedPath) === false) {
                    tests.push(normalizedPath);
                }
            }

            this.pushToCache(resource, root, pattern, newCache);
        } else {
            for (let index = 0; index < cache.length; index++) {
                if (tests.includes(cache[index]) === false) {
                    tests.push(cache[index]);
                }
            }
        }
    }

    private extractTest(resource: string, tests: Array<string>): void {
        if (typeof resource !== 'string' || resource.length === 0) {
            return;
        }

        const source = path.parse(resource);
        const userGlob = this.router(source);
        const rootsCount = this.roots.length;

        let patternIndex;

        for (let rootIndex = 0; rootIndex < rootsCount; rootIndex++) {
            let root = this.roots[rootIndex];

            if (Array.isArray(userGlob)) {
                for (patternIndex = 0; patternIndex < userGlob.length; patternIndex++) {
                    this.processPattern(resource, root, userGlob[patternIndex], tests);
                }

                continue;
            }

            this.processPattern(resource, root, userGlob, tests);
        }
    }

    private static createGlobConfig(root: string): object {
        return {
            cwd: root
        };
    }
}

export {TestExtractor};
