import { expect, assert } from 'chai';
import { JsonRpc, toPromise } from '../src/jsonrpc';
import web3 from './web3Mocked.js';

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
    let address;

    beforeEach(() => {
        blockFrom = 3577505;
        blockTo = 3578800;
        address = ["0xa74476443119A942dE498590Fe1f2454d7D4aC0d"];
        callbackExecutedCounter = 0
        jsonRpc = new JsonRpc(address, blockFrom, blockTo, web3, tranactionHandler);
    });

    it('expectedIterations should equal callbackExecutedCounter', () => {
        /**
         * Number of all transactions are 19 in each block
         * Number of transactions that have the targeted address is 3
         */
        const expectedIterations = 3 * (blockTo - blockFrom);

        jsonRpc.scanBlocks().then((e) => {
            expect(callbackExecutedCounter).to.equal(expectedIterations)
        }).catch((e) => {
            throw new Error(e)
        });
    })

});
