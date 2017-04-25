const chai = require('chai');
const moduleA = require('../src/module-a');

describe('CSS module export', () => {
    it('should export test class', (done) => {
        chai.expect(typeof moduleA.test).to.be.equal('string');
        done();
    });
});
