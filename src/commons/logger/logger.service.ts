import { Injectable } from '@nestjs/common';
import winston from 'winston';
import LokiTransport from 'winston-loki';

import { AppConfigService } from '../config';

import { LoggerContext } from './logger.context';

@Injectable()
export class AppLoggerService {
  private logger: winston.Logger;
  private transports: {
    console: winston.transport;
    loki: LokiTransport;
  };

  constructor(private readonly appConfigService: AppConfigService) {
    this.transports = {
      console: new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.prettyPrint(),
        ),
      }),
      loki: new LokiTransport({
        host: this.appConfigService.LOKI_URL,
        basicAuth: `${this.appConfigService.LOKI_USER}:${this.appConfigService.LOKI_PASS}`,
        labels: {
          service: this.appConfigService.API_NAME,
        },
        json: true,
        format: winston.format.json(),
        onConnectionError: (error) => console.error(error),
      }),
    };
    this.logger = winston.createLogger({
      level: this.appConfigService.LOG_LEVEL,
      transports:
        this.appConfigService.NODE_ENV === 'development'
          ? [this.transports.console]
          : [this.transports.loki],
    });
  }

  log(level: 'info' | 'warn' | 'error', message: string, meta: Record<string, unknown> = {}) {
    const getContext = LoggerContext.get();
    const getMeta = {
      ...getContext,
      ...meta,
    };
    this.logger[level](message, getMeta);
  }

  addMeta(key: string, value: Record<string, unknown>) {
    LoggerContext.set(key, value);
  }

  appendMeta(key: string, value: Record<string, unknown>) {
    LoggerContext.append(key, value);
  }
}
