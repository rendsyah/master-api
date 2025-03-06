import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AppLoggerService } from '../logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly appLoggerService: AppLoggerService) {}

  hideSensitive(data: Record<string, unknown>) {
    if (!data) return {};
    const sensitiveFields = new Set(['password', 'otp']);
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        sensitiveFields.has(key) ? '[REDACTED]' : value,
      ]),
    );
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();

    const intercept = {
      req: {
        method: request.method,
        protocol: request.protocol,
        httpVersion: request.httpVersion,
        url: request.url,
        remoteAddress: request.ip,
        headers: {
          host: request.headers['host'] ?? '',
          referer: request.headers['referer'] ?? '',
          accept: request.headers['accept'] ?? '',
          'user-agent': request.headers['user-agent'] ?? '',
          'content-type': request.headers['content-type'] ?? '',
          'x-forwarded-for': request.headers['x-forwarded-for'] ?? '',
        },
        body: this.hideSensitive(request.body),
        query: { ...request.query },
        params: { ...request.params },
      },
      res: undefined as unknown,
      stack: undefined as unknown,
      responseTime: 0,
    };

    return next.handle().pipe(
      tap((data: unknown) => {
        const statusCode = response.statusCode;
        const responseTime = Date.now() - startTime;

        intercept.res = {
          statusCode,
          data,
        };
        intercept.responseTime = responseTime;

        this.appLoggerService.log('info', 'HTTP Request', intercept);
      }),
      catchError((error: unknown) => {
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;
        const message = error instanceof HttpException ? error.message : 'Internal Server Error';
        const errors =
          error instanceof HttpException && typeof error.getResponse() === 'object'
            ? error.getResponse()?.['errors']
            : [];

        const stack = error instanceof Error ? error.stack : error;
        const responseTime = Date.now() - startTime;

        intercept.res = {
          statusCode,
          message,
          errors,
        };
        intercept.stack = stack;
        intercept.responseTime = responseTime;

        if (statusCode === 500) {
          this.appLoggerService.log('error', 'HTTP Request', intercept);
        } else {
          this.appLoggerService.log('warn', 'HTTP Request', intercept);
        }

        return throwError(() => error);
      }),
    );
  }
}
