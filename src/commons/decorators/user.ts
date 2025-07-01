import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IUser } from '../utils/utils.types';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user: IUser }>();
  return request.user;
});
