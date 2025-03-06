import { Injectable } from '@nestjs/common';
import winston from 'winston';
import LokiTransport from 'winston-loki';

import { AppConfigService } from '../config';

@Injectable()
export class AppLoggerService {
  private logger: winston.Logger;
  private transports: {
    console: winston.transport;
    loki: LokiTransport;
  };

  private extra: Record<string, unknown> = {};

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
        labels: { service: 'master-service' },
        json: true,
        format: winston.format.json(),
        onConnectionError: (error) => console.error(error),
      }),
    };
    this.logger = winston.createLogger({
      transports:
        this.appConfigService.NODE_ENV !== 'production'
          ? [this.transports.console]
          : [this.transports.loki],
    });
  }

  log(level: 'info' | 'warn' | 'error', message: string, meta: Record<string, unknown> = {}) {
    const request = { ...meta };

    if (Object.values(this.extra).length > 0) {
      request.z_extra = this.extra;
      this.extra = {};
    }

    this.logger[level](message, request);
  }

  setExtra(extra: Record<string, unknown>) {
    this.extra = { ...this.extra, ...extra };
  }
}
