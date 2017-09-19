/**
 * 
 * This worker should be responable to iterate over the blocks 
 * to get all the transactions for givien address using geth node
 * 
 */
import io from 'socket.io-client';
import { decodeInputData } from '../input_data_decoder';
import { getSocketPortNumber } from '../config';

const TIMER = 2000;

const socket = io.connect(`http://localhost:${getSocketPortNumber()}`, { reconnect: true });

// Temporary object
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

const getTransaction = () => singleTransactionTemplate;


/**
 * This send the transaction and the decoded input to the event lister
 * 
 * @param address
 * @param tx
 * @param decodedInputData
 */
const emitTransaction = (address, tx, decodedInputData) => {
  socket.emit('tx', { address, tx, decodedInputData });
};


/**
 * This represets a serial of JSONRPC requests to Geth and emit each transaction by socket io
 * 
 * @param blockFrom
 * @param blockTo
 * @param address
 */
export default async (blockFrom, blockTo, address) => setInterval(() => {
  const tx = getTransaction();
  const decodedInputData = decodeInputData(tx);
  emitTransaction(address, tx, decodedInputData);
}, TIMER);
