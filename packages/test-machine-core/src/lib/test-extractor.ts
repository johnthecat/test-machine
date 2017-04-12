import {TRouter} from '../interface';
import * as path from 'path';
import * as glob from 'glob';

class TestExtractor {

    private globParserConfig: object = {
        cwd: this.root
    };

    private globCache: Map<string | Array<string>, string> = new Map();

    constructor(private root: string, private router: TRouter) {}

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

    private extractTest(resource: string, tests: Array<string>): void {
        if (typeof resource !== 'string' || resource.length === 0) {
            return;
        }

        const source = path.parse(resource);
        const pattern = this.router(source);

        let globParseResult;

        if (this.globCache.has(pattern)) {
            globParseResult = this.globCache.get(pattern);
        } else {

            if (typeof pattern === 'string') {

                if (pattern.length !== 0) {
                    globParseResult = glob.sync(pattern, this.globParserConfig);
                } else {
                    globParseResult = [];
                }

            } else if (Array.isArray(pattern)) {
                globParseResult = [];

                let item;

                for (let index = 0, count = pattern.length; index < count; index++) {
                    item = pattern[index];

                    if (typeof item === 'string' && item.length !== 0) {
                        globParseResult = globParseResult.concat(glob.sync(item, this.globParserConfig));
                    }
                }
            }

            this.globCache.set(pattern, globParseResult);
        }

        if (!globParseResult || globParseResult.length === 0) {
            return;
        }

        let test;

        for (let index = 0, count = globParseResult.length; index < count; index++) {
            test = path.resolve(this.root, globParseResult[index]);

            if (!tests.includes(test)) {
                tests.push(test);
            }
        }
    }
}

export {TestExtractor};
