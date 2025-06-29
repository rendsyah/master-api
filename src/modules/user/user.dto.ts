import { createZodCustomDto } from 'src/commons/zod';
import { CreateAccessSchema, ListUserSchema, UpdateAccessSchema } from './user.pipe';

export class ListUserDto extends createZodCustomDto(ListUserSchema) {}

export class CreateAccessDto extends createZodCustomDto(CreateAccessSchema) {}

export class UpdateAccessDto extends createZodCustomDto(UpdateAccessSchema) {}
