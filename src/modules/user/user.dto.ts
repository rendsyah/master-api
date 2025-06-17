import { createZodCustomDto } from 'src/commons/zod';
import { CreateAccessSchema, UpdateAccessSchema, UserListSchema } from './user.pipe';

export class UserListDto extends createZodCustomDto(UserListSchema) {}

export class CreateAccessDto extends createZodCustomDto(CreateAccessSchema) {}

export class UpdateAccessDto extends createZodCustomDto(UpdateAccessSchema) {}
