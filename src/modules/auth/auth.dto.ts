import { createZodCustomDto } from 'src/commons/zod';
import { LoginSchema, PermissionSchema } from './auth.pipe';

export class PermissionDto extends createZodCustomDto(PermissionSchema) {}

export class LoginDto extends createZodCustomDto(LoginSchema) {}
