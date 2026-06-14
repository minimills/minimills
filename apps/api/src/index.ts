import http from 'http';
import { app } from './app';
import { initializeSocket } from './socket';
import { connectRedis } from './config/redis';
import { ensureMinIOBucket } from './config/storage';
import { startWorkers } from './workers';

const PORT = parseInt(process.env.API_PORT || '3001', 10);

async function bootstrap() {
  await connectRedis();
  await ensureMinIOBucket();

  const server = http.createServer(app);
  initializeSocket(server);
  startWorkers();

  server.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  const shutdown = async () => {
    console.log('Shutting down...');
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
