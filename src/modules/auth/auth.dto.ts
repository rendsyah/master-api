import { createZodCustomDto } from 'src/commons/zod';
import { LoginSchema } from './auth.pipe';

export class LoginDto extends createZodCustomDto(LoginSchema) {}
