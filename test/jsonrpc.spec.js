import { expect, assert } from 'chai';
import { JsonRpc, toPromise } from '../src/jsonrpc';
import { web3, web3EmptyData } from './web3Mocked.js';

let callbackExecutedCounter = 0
const tranactionHandler = (tranaction, logs) => {
    callbackExecutedCounter++;
}

describe('toPromise', () => {
    it('Should return promise from the callback function', async () => {
        const testFunctionWithCallback = (input, callback) => {
            callback(null, `${input} response`)
        }

        const result = await toPromise(testFunctionWithCallback)("Test input string");
        expect(result).to.equal('Test input string response');
    });

    it('Should reject the promise and return an Error', async () => {
        const expectedTesingMessage = "Testing Error Message";
        const testFunctionWithCallback = (input, callback) => {
            callback({ message: expectedTesingMessage }, `${input} response`)
        }
        try {
            const result = await toPromise(testFunctionWithCallback)("Test input string");
        } catch (e) {
            expect(e.message).to.equal(expectedTesingMessage);
        }
    });
})

describe('JsonRpc', () => {
    let jsonRpc;
    let blockFrom;
    let blockTo;
    let addresses;

    beforeEach(() => {
        blockFrom = 3577505;
        blockTo = 3578800;
        addresses = ["0xa74476443119A942dE498590Fe1f2454d7D4aC0d"];
        callbackExecutedCounter = 0
    });

    it('Should have 0 callbackExecutedCounter because there\'s no address to check', async () => {
        addresses = [];
        jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, web3, tranactionHandler);
        const r = await jsonRpc.scanBlocks();
        expect(callbackExecutedCounter).to.equal(0);
    });

    it('Should have 0 callbackExecutedCounter because block has no transactions', async () => {
        addresses = ["0xa74476443119A942dE498590Fe1f2454d7D4aC0d"];
        jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, web3EmptyData, tranactionHandler);
        const r = await jsonRpc.scanBlocks();
        expect(callbackExecutedCounter).to.equal(0);
    });

    it('expectedIterations should equal callbackExecutedCounter', async () => {
        /**
         * Number of all transactions are 20 in each block
         * Number of transactions that have the targeted address is 3        
         */
        addresses = ["0xa74476443119A942dE498590Fe1f2454d7D4aC0d", "0xa74476443119A942dE498590Fe1f2454d7D4aC01"];
        const expectedIterations = 3 * (blockTo - blockFrom);
        jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, web3, tranactionHandler);
        const r = await jsonRpc.scanBlocks();
        expect(callbackExecutedCounter).to.equal(expectedIterations)
    });

    it('expectedIterations should equal callbackExecutedCounter', async () => {
        /**
         * Number of all transactions are 20 in each block
         * Number of transactions that have the targeted address is 3        
         */
        const expectedIterations = 3 * (blockTo - blockFrom);
        jsonRpc = new JsonRpc(addresses, blockFrom, blockTo, web3, tranactionHandler);
        const r = await jsonRpc.scanBlocks();
        expect(callbackExecutedCounter).to.equal(expectedIterations)
    });
    
});
