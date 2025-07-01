import { Injectable } from '@nestjs/common';

import { logger } from './logger.instance';
import { LoggerContext } from './logger.context';

@Injectable()
export class AppLoggerService {
  log(level: 'info' | 'warn' | 'error', message: string, meta: Record<string, unknown> = {}) {
    const context = LoggerContext.get();
    const fullMeta = {
      ...context,
      ...meta,
    };
    logger[level](message, fullMeta);
  }

  addMeta(key: string, value: Record<string, unknown>) {
    LoggerContext.set(key, value);
  }

  appendMeta(key: string, value: Record<string, unknown>) {
    LoggerContext.append(key, value);
  }
}
