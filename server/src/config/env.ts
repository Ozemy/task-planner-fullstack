import 'dotenv/config';

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readOptional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function readNullable(name: string): string | null {
  return process.env[name]?.trim() || null;
}

function readPort(): number {
  const rawPort = process.env.PORT ?? '4000';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  return port;
}

function readOptionalPort(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue?.trim()) {
    return fallback;
  }

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

type NodeEnv = 'development' | 'production' | 'test';

function readNodeEnv(): NodeEnv {
  return process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test'
    ? process.env.NODE_ENV
    : 'development';
}

function readCookieSecure(nodeEnv: NodeEnv): boolean {
  const rawValue = process.env.COOKIE_SECURE?.trim().toLowerCase();

  if (!rawValue || rawValue === 'auto') {
    return nodeEnv === 'production';
  }

  if (rawValue === 'true') {
    return true;
  }

  if (rawValue === 'false') {
    return false;
  }

  throw new Error('COOKIE_SECURE must be "auto", "true", or "false".');
}

const sessionSecret = readRequired('SESSION_SECRET');
if (sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters long.');
}

const clientOrigin = readOptional('CLIENT_ORIGIN', 'http://127.0.0.1:5173');
const nodeEnv = readNodeEnv();

export const env = {
  databaseUrl: readRequired('DATABASE_URL'),
  sessionSecret,
  clientOrigin,
  appOrigin: readOptional('APP_ORIGIN', clientOrigin),
  nodeEnv,
  cookieSecure: readCookieSecure(nodeEnv),
  port: readPort(),
  sessionMaxAgeDays: 30,
  smtpHost: readNullable('SMTP_HOST'),
  smtpPort: readOptionalPort('SMTP_PORT', 587),
  smtpUser: readNullable('SMTP_USER'),
  smtpPass: readNullable('SMTP_PASS'),
  smtpFrom: readOptional('SMTP_FROM', 'Task Planner <no-reply@task-planner.local>'),
  googleClientId: readNullable('GOOGLE_CLIENT_ID'),
};
