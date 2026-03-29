import env from './config/env';
import app from './app';
import prisma from './config/db';

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 RMS Backend Server Running              ║
║   Port:        ${String(env.PORT).padEnd(30)}║
║   Environment: ${env.NODE_ENV.padEnd(30)}║
║   Health:      http://localhost:${env.PORT}/api/health  ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
