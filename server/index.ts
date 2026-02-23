import http from 'http';
import express from 'express';
import { initSocket } from '../lib/socket';

const app = express();
const server = http.createServer(app);
initSocket(server);

app.get('/', (_req, res) => res.send('Socket server up'));

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
});
