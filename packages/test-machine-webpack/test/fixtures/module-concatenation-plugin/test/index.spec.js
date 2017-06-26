const chai = require('chai');
const {moduleA, moduleB} = require('../src/index');

describe('index', () => {
    it('should exist', () => {
        chai.expect(moduleA).to.be.deep.equal({});
        chai.expect(moduleB).to.be.deep.equal({});
    });
});
