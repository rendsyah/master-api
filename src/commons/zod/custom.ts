import { ZodSchema, ZodTypeDef } from 'zod';
import { ZodDto, zodToOpenAPI } from 'nestjs-zod';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

const isSchemaObject = (input: SchemaObject | ReferenceObject): input is SchemaObject =>
  !('$ref' in input);

const updateRequiredProp = (
  properties?: SchemaObject['properties'],
  required?: SchemaObject['required'],
): SchemaObject['properties'] | undefined => {
  if (!properties) return properties;
  const requiredArray = Array.isArray(required) ? required : [];

  Object.entries(properties).forEach(([key, value]) => {
    if (isSchemaObject(value)) {
      if (value.type === 'object') {
        updateRequiredProp(value.properties, value.required);
      }
      Object.assign(value, { required: requiredArray.includes(key) });
    }
  });

  return properties;
};

export function createZodCustomDto<
  TOutput = unknown,
  TDef extends ZodTypeDef = ZodTypeDef,
  TInput = TOutput,
>(schema: ZodSchema<TOutput, TDef, TInput>) {
  class AugmentedZodDto {
    static isZodDto = true;
    static schema = schema;

    static _OPENAPI_METADATA_FACTORY(): Record<string, unknown> | undefined {
      const schemaObject = zodToOpenAPI(this.schema);
      return updateRequiredProp(schemaObject.properties, schemaObject.required);
    }

    static create(input: TInput) {
      return this.schema.parse(input);
    }
  }

  return AugmentedZodDto as unknown as ZodDto<TOutput, TDef, TInput>;
}
