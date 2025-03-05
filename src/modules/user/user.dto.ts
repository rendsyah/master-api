import { createZodDto } from 'nestjs-zod';

import { CreateAccessSchema, UpdateAccessSchema } from './user.pipe';

export class CreateAccessDto extends createZodDto(CreateAccessSchema) {}

export class UpdateAccessDto extends createZodDto(UpdateAccessSchema) {}
