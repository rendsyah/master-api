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
>(
  schema: ZodSchema<TOutput, TDef, TInput>,
  fileFields: Record<string, 'single' | 'multiple'> = {},
) {
  const multipartFields: Record<string, SchemaObject> = Object.fromEntries(
    Object.entries(fileFields).map(([name, mode]) => [
      name,
      mode === 'multiple'
        ? {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          }
        : {
            type: 'string',
            format: 'binary',
          },
    ]),
  );

  const requiredFields = Object.keys(fileFields);

  class AugmentedZodDto {
    static isZodDto = true;
    static schema = schema;

    static _OPENAPI_METADATA_FACTORY(): Record<string, unknown> | undefined {
      const schemaObject = zodToOpenAPI(this.schema);

      schemaObject.properties = {
        ...schemaObject.properties,
        ...multipartFields,
      };

      schemaObject.required = [...(schemaObject.required ?? []), ...requiredFields];

      return updateRequiredProp(schemaObject.properties, schemaObject.required);
    }

    static create(input: TInput) {
      return this.schema.parse(input);
    }
  }

  return AugmentedZodDto as unknown as ZodDto<TOutput, TDef, TInput>;
}
