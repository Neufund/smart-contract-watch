import { expect } from 'chai';
import { getSocketPortNumber, getLogLevel, getRPCNode } from '../src/config';

describe('getSocketPortNumber', () => {
    it('should return port number from .env file', () => {
        const portNumber = getSocketPortNumber();            
        expect(portNumber).to.be.a('number').above(0).and.satisfy(Number.isInteger);
    });
});

describe('getLogLevel', () => {
    it('should return port number from .env file', () => {
        const portNumber = getLogLevel();            
        expect(portNumber).to.be.a('string')
    });
})

describe('getRPCNode', () => {
    it('should return port number from .env file', () => {
        const portNumber = getRPCNode();            
        expect(portNumber).to.be.a('string')
    });
})
