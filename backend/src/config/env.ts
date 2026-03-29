import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  EXCHANGERATE_API_KEY: string;
}

function getEnv(): EnvConfig {
  const { PORT, NODE_ENV, DATABASE_URL, JWT_SECRET, EXCHANGERATE_API_KEY } = process.env;

  if (!DATABASE_URL) {
    throw new Error('❌ DATABASE_URL is required in .env — Get free PostgreSQL at https://neon.tech');
  }

  if (!JWT_SECRET) {
    throw new Error('❌ JWT_SECRET is required in .env');
  }

  return {
    PORT: parseInt(PORT || '4000', 10),
    NODE_ENV: NODE_ENV || 'development',
    DATABASE_URL,
    JWT_SECRET,
    EXCHANGERATE_API_KEY: EXCHANGERATE_API_KEY || '',
  };
}

const env = getEnv();
export default env;
