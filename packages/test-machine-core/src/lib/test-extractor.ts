import { Router } from '../interface';
import * as path from 'path';
import * as glob from 'glob';
import { Collection } from './collection';

type GlobCalculationResult = Array<string>;

class TestExtractor {

    private globCache = new Collection<GlobCalculationResult>();

    constructor(private roots: Array<string>, private router: Router) {}

    public extractTests(changedModules: Array<string>): Array<string> {
        const tests: Array<string> = [];

        if (Array.isArray(changedModules) === false) {
            return tests;
        }

        const count = changedModules.length;

        for (let index = 0; index < count; index++) {
            this.extractTest(changedModules[index], tests);
        }

        return tests;
    }

    public clearCache(): void {
        this.globCache.clear();
    }

    private getCacheKey(resource: string, root: string, pattern: string): string {
        return `${resource}_${root}_${pattern}`;
    }

    private getFromCache(resource: string, root: string, pattern: string): GlobCalculationResult | void {
        return this.globCache.get(this.getCacheKey(resource, root, pattern));
    }

    private pushToCache(resource: string, root: string, pattern: string, value: GlobCalculationResult): void {
        return this.globCache.set(this.getCacheKey(resource, root, pattern), value);
    }

    private processPattern(resource: string, root: string, pattern: string, tests: Array<string>): void {
        if (typeof pattern !== 'string' || pattern.length === 0) {
            return;
        }

        const cache = this.getFromCache(resource, root, pattern);

        if (Array.isArray(cache)) {
            for (let index = 0, count = cache.length; index < count; index++) {
                if (tests.includes(cache[index]) === false) {
                    tests.push(cache[index]);
                }
            }
        } else {
            const globResult = glob.sync(pattern, TestExtractor.createGlobConfig(root));
            const newCache = new Array(globResult.length);

            let normalizedPath;

            for (let index = 0, count = globResult.length; index < count; index++) {
                normalizedPath = path.resolve(root, globResult[index]);
                newCache[index] = normalizedPath;

                if (tests.includes(normalizedPath) === false) {
                    tests.push(normalizedPath);
                }
            }

            this.pushToCache(resource, root, pattern, newCache);
        }
    }

    private extractTest(resource: string, tests: Array<string>): void {
        if (typeof resource !== 'string' || resource.length === 0) {
            return;
        }

        const roots = this.roots;
        const rootsCount = roots.length;

        if (rootsCount === 0) {
            return;
        }

        const source = path.parse(resource);
        const userGlob = this.router(source);

        // fast path: if glob is undefined or empty string - exit from function
        if (!userGlob) {
            return;
        }

        let patternIndex;
        let root;

        for (let rootIndex = 0; rootIndex < rootsCount; rootIndex++) {
            root = roots[rootIndex];

            if (Array.isArray(userGlob)) {
                for (patternIndex = 0; patternIndex < userGlob.length; patternIndex++) {
                    this.processPattern(resource, root, userGlob[patternIndex], tests);
                }
            } else if (typeof userGlob === 'string') {
                this.processPattern(resource, root, userGlob, tests);
            }
        }
    }

    private static createGlobConfig(root: string): object {
        return {
            cwd: root
        };
    }
}

export { TestExtractor };
