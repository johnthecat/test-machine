const moduleA = require('../src/module-a');

describe('test', () => {
    it('should fail', (done) => {
        done(new Error('module-a is valid, failing...'));
    });
});
