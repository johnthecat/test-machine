import { CompilerSource } from 'test-machine-core/src/interface';
import { jasmineEngine } from './engines/jasmine';
import { mochaEngine } from './engines/mocha';

import { babelCompiler } from './compilers/babel';

export const engine = {
    jasmine: jasmineEngine,
    mocha: mochaEngine,
};

export const compiler = {
    babel: babelCompiler
};

export { CompilerSource };
