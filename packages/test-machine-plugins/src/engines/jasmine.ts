import { Engine } from 'test-machine-interfaces';
import { noModuleException } from '../utils';

export function jasmineEngine(config?: any): Engine {
    let Jasmine: any;

    try {
        Jasmine = require('jasmine');
    } catch (e) {
        throw noModuleException('jasmine');
    }

    let jasmine: any;

    return (tests: Array<string>): Promise<any> => {
        if (tests.length === 0) {
            return Promise.resolve();
        }

        jasmine = new Jasmine();
        jasmine.loadConfig(
            Object.assign({}, config, {
                spec_files: tests
            })
        );

        return new Promise((resolve, reject) => {
            jasmine.onComplete((passed: boolean) => {
                jasmine = null;

                if (passed) {
                    resolve();
                } else {
                    reject();
                }
            });

            jasmine.execute();
        });
    };
}
