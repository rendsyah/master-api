import { createZodDto } from 'nestjs-zod';

import { LoginSchema } from './auth.pipe';

export class LoginDto extends createZodDto(LoginSchema) {}
