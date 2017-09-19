import dotenv from 'dotenv';

dotenv.config();

/**
 * getSocketPortNumber will return the port number from .env file 
 */
/* eslint-disable */
export const getSocketPortNumber = () => parseInt(process.env.SOCKET_IO_PORT, 10);
/* eslint-enable */
