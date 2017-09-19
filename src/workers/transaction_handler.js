import http from 'http';
import socketIo from 'socket.io';
import logger from '../logger';
import { getSocketPortNumber } from '../config';

const app = http.createServer();
const io = socketIo(app);

app.listen(getSocketPortNumber());

io.on('connection', (socket) => {
  socket.on('tx', (data) => {
    logger.log('debug','New entry', data.address);
  });
});
