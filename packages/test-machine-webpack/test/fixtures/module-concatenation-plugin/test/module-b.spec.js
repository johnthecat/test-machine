const chai = require('chai');
const moduleB = require('../src/module-b').default;

describe('moduleB', () => {
    it('should exist', () => {
        chai.expect(moduleB).to.be.deep.equal({});
    });
});
