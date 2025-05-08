import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Response<T> = {
  statusCode: number;
  message: string;
  data: T;
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
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
