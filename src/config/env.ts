import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL?: string;
  PORT: number;
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnvVarOptional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

function validateEnv(): EnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];
  
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}. Must be one of: development, production, test`);
  }

  return {
    SUPABASE_URL: getEnvVar('SUPABASE_URL'),
    SUPABASE_KEY: getEnvVar('SUPABASE_KEY'),
    NODE_ENV: nodeEnv,
    LOG_LEVEL: getEnvVarOptional('LOG_LEVEL', 'info'),
    PORT: parseInt(getEnvVarOptional('PORT', '3333'), 10),
  };
}

export const env = validateEnv();


