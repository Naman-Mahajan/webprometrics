// Simple logger utility for client-side logging
// Provides basic console logging with structured prefixes

export type LogLevel = 'info' | 'warn' | 'error' | 'audit';

const format = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  return meta !== undefined
    ? `[${timestamp}] [${level.toUpperCase()}] ${message}`
    : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

const log = (level: LogLevel, message: string, meta?: unknown) => {
  const text = format(level, message, meta);
  if (level === 'error') {
    console.error(text, meta ?? '');
  } else if (level === 'warn') {
    console.warn(text, meta ?? '');
  } else {
    console.log(text, meta ?? '');
  }
};

export const Logger = {
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
  audit: (message: string, meta?: unknown) => log('audit', message, meta),
};
