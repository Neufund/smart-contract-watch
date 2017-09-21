import { expect } from 'chai';
import { JsonRpc, toPromise } from '../src/jsonrpc';
import web3 from './web3Mocked.js';
import logger from '../src/logger';

let callbackExecutedCounter = 0
const tranactionHandler = (tranaction, logs) => {
    callbackExecutedCounter++;
}

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