import { expect } from 'chai';
import { getSocketPortNumber } from '../src/config';

describe('getSocketPortNumber', () => {
    it('should return port number from .env file', () => {
        const portNumber = getSocketPortNumber();            
        expect(portNumber).to.be.a('number').above(0).and.satisfy(Number.isInteger);
    });
})