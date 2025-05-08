import { createZodCustomDto } from 'src/commons/zod';
import { CreateAccessSchema, UpdateAccessSchema } from './user.pipe';

export class CreateAccessDto extends createZodCustomDto(CreateAccessSchema) {}

export class UpdateAccessDto extends createZodCustomDto(UpdateAccessSchema) {}
