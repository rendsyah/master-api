import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import winston from 'winston';
import LokiTransport from 'winston-loki';

@Injectable()
export class AppLoggerService {
  private transports: {
    console: winston.transport;
    loki: LokiTransport;
  };
  private logger: winston.Logger;
  private meta: Record<string, unknown> = {};

  constructor(private readonly configService: ConfigService) {
    this.transports = {
      console: new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.prettyPrint(),
        ),
      }),
      loki: new LokiTransport({
        host: this.configService.getOrThrow('LOKI_URL', { infer: true }),
        labels: { app: 'master-app' },
        json: true,
        format: winston.format.json(),
        onConnectionError: (error) => console.error(error),
      }),
    };
    this.logger = winston.createLogger({
      transports:
        this.configService.get('NODE_ENV', { infer: true }) !== 'production'
          ? [this.transports.console]
          : [this.transports.loki],
    });
  }

  log(level: string, message: Record<string, unknown>) {
    this.logger[level](message, { meta: this.meta });
    this.meta = {};
  }

  setMeta(meta: Record<string, unknown>) {
    this.meta = { ...this.meta, ...meta };
  }
}
