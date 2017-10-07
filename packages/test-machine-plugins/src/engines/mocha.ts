import { Engine } from 'test-machine-core/src/interface';
import { noModuleException } from '../utils';

export function mochaEngine(config?: any): Engine {
    let Mocha: any;

    try {
        Mocha = require('mocha');
    } catch (e) {
        throw noModuleException('mocha');
    }

    let mocha: any;
    let index: number;
    let count: number;

    return (tests: Array<string>): Promise<any> => {
        if (tests.length === 0) {
            return Promise.resolve();
        }

        mocha = new Mocha(config);

        for (index = 0, count = tests.length; index < count; index++) {
            mocha.addFile(tests[index]);
        }

        return new Promise((resolve, reject) => {
            mocha.run((errors: number) => {
                if (errors) {
                    reject();
                } else {
                    resolve();
                }

                mocha = null;
            });
        });
    };
}
