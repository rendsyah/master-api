import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

type ValidationErrors = {
  path: string[];
  message: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

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

    if (exception instanceof HttpException) {
      fallbackResponse.statusCode = exception.getStatus();
      fallbackResponse.errorCode = HttpStatus[fallbackResponse.statusCode];
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const { message: responseMessage, errors: responseErrors } = exceptionResponse as {
          message: string;
          errors: ValidationErrors[];
        };
        fallbackResponse.message = responseMessage || message;
        fallbackResponse.errors = responseErrors
          ? responseErrors.map((error) => ({
              field: error.path.join('.'),
              message: error.message,
            }))
          : [];
      } else {
        fallbackResponse.message = String(exceptionResponse);
      }
    }

    httpAdapter.reply(response, fallbackResponse, fallbackResponse.statusCode);
  }
}
