import { isChatDebugEnabled } from './config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function write(level: LogLevel, event: string, data: Record<string, unknown>) {
  if (level === 'debug' && !isChatDebugEnabled()) return;

  const payload = {
    level,
    event,
    time: new Date().toISOString(),
    ...data,
  };

  const line = `[CHAT_${level.toUpperCase()}] ${JSON.stringify(payload)}`;

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const chatLogger = {
  info: (event: string, data: Record<string, unknown> = {}) => write('info', event, data),
  warn: (event: string, data: Record<string, unknown> = {}) => write('warn', event, data),
  error: (event: string, data: Record<string, unknown> = {}) => write('error', event, data),
  debug: (event: string, data: Record<string, unknown> = {}) => write('debug', event, data),
};

export function errorToLog(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isChatDebugEnabled() ? error.stack : undefined,
    };
  }

  return { message: String(error) };
}
