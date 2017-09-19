import http from 'http';
import socketIo from 'socket.io';
import { SOCKET_IO_PORT } from '../config';

const app = http.createServer();
const io = socketIo(app);

app.listen(SOCKET_IO_PORT);

io.on('connection', (socket) => {
  socket.on('tx', (data) => {
    console.log('New entry', data.address);
  });
});