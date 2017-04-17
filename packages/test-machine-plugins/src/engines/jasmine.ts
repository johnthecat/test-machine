import {TEngine} from 'test-machine-core/src/interface';
import {noModuleException} from '../utils';

export function jasmineEngine(config?): TEngine {
    let Jasmine;

    try {
        Jasmine = require('jasmine');
    } catch (e) {
        throw noModuleException('jasmine');
    }

    let jasmine;

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
            jasmine.onComplete((passed) => {
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
