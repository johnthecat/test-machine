/// <reference types="mocha" />

import * as chai from 'chai';
import { Compiler } from '../src/lib/compiler';
import { SandboxController } from '../src/lib/sandbox-controller';

// TODO write tests

describe('SandboxController', () => {
    it('should correct resolve map of modules', () => {
        const compiler = new Compiler([]);
        const controller = new SandboxController(compiler);

        chai.expect(controller).to.be.instanceof(SandboxController);
    });
});
