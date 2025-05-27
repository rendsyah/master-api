import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user: Utils.IUser }>();
  return request.user;
});
