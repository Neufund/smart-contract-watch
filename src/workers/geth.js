/**
 *
 * This worker should be responable to iterate over
 * geth ethereum client node and get the transactions out,
 * then pass them into the decoders module
 *
 * The Process:
 * 1- Connect to geth
 * 2- Start listener
 * 3- Parse the reponse into its decoder
 *
 */
import { decodeInputData } from '../input_data_decoder';

const singleTransactionTemplate = {
  hash: '0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b',
  nonce: 2,
  blockHash: '0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46',
  blockNumber: 3,
  transactionIndex: 0,
  from: '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b',
  to: '0x6295ee1b4f6dd65047762f924ecd367c17eabf8f',
  value: 123,
  gas: 314159,
  gasPrice: 123,
  input: '0x57cb2fc4',
};

const TIMER = 1000;

const getTransaction = () => singleTransactionTemplate;

const sendToRabbitMq = (tx, decodedInputData) => console.log(`tx: ${tx}, decoded: ${decodedInputData} sent to Rabbit`);

export const geth = (/* add params when used */) => setInterval(() => {
  /**
     *
     * This represets a serial of JSONRPC requests to Geth, and
     */

  const tx = getTransaction();
  const decodedInputData = decodeInputData(tx);
  sendToRabbitMq(tx, decodedInputData);
}, TIMER);

export default geth;
