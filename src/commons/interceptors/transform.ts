import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type TransformResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, TransformResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<TransformResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode || 200;
        const message = 'Success';

        const fallbackResponse = {
          statusCode,
          message,
          data,
        };

        if (data && 'message' in data) {
          const { message: overrideMessage, ...rest } = data;
          fallbackResponse.message = overrideMessage || message;
          fallbackResponse.data = rest;
        }

        return fallbackResponse;
      }),
    );
  }
}
