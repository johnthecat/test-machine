const chai = require('chai');
const moduleA = require('../src/module-a').default;

describe('moduleA', () => {
    it('should exist', () => {
        chai.expect(moduleA).to.be.deep.equal({});
    });
});
