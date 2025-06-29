import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AppLoggerService, LoggerContext } from '../logger';

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

    if (request.url === '/api/v1/health') {
      return next.handle();
    }

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
      res: {} as unknown,
      meta: {} as unknown,
      stack: {} as unknown,
      stackError: {} as unknown,
      responseTime: 0,
    };

    return LoggerContext.run(intercept.meta, () =>
      next.handle().pipe(
        tap((data: unknown) => {
          const responseTime = Date.now() - startTime;

          delete intercept.stack;
          delete intercept.stackError;

          intercept.res = data;
          intercept.responseTime = responseTime;

          this.appLoggerService.log('info', 'HTTP Request', intercept);
        }),
        catchError((error: unknown) => {
          const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          const message = 'An unexpected error occurred';
          const data = null;
          const errorCode = HttpStatus[statusCode];
          const errors: unknown[] = [];
          const traceId = request.traceId;

          const fallbackResponse = {
            statusCode,
            message,
            data,
            errorCode,
            errors,
            traceId,
          };

          if (error instanceof HttpException) {
            fallbackResponse.statusCode = error.getStatus();
            fallbackResponse.errorCode = HttpStatus[fallbackResponse.statusCode];
            const exceptionResponse = error.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
              const { message: responseMessage, errors: responseErrors } = exceptionResponse as {
                message: string;
                errors: unknown[];
              };
              fallbackResponse.message = responseMessage || message;
              fallbackResponse.errors = responseErrors || [];
            } else {
              fallbackResponse.message = String(exceptionResponse);
            }
          }

          const stack = error instanceof Error ? (error.stack ?? '') : '';
          const stackError = error;

          const responseTime = Date.now() - startTime;

          intercept.res = fallbackResponse;
          intercept.stack = stack;
          intercept.stackError = stackError;
          intercept.responseTime = responseTime;

          if (fallbackResponse.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.appLoggerService.log('error', 'HTTP Request', intercept);
          } else {
            this.appLoggerService.log('warn', 'HTTP Request', intercept);
          }

          return throwError(() => error);
        }),
      ),
    );
  }
}
