import dotenv from 'dotenv';

dotenv.config();

export const getSocketPortNumber = () => parseInt(process.env.SOCKET_IO_PORT, 10);

export const getLogLevel = () => process.env.LOG_LEVEL;

export const getRPCNode = () => process.env.RPC_URL;
