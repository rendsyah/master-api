import { z } from 'zod';

export const ListUserSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z
    .preprocess((value) => Number(value), z.number().min(0).max(1))
    .optional()
    .describe('0 -> inactive, 1 -> active'),
  orderBy: z.enum(['id', 'fullname', 'access_name', 'email', 'phone', 'status']).optional(),
  sort: z.enum(['ASC', 'DESC']).optional(),
  search: z.string().min(1).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe('2025-06-01'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe('2025-06-31'),
});

export const CreateAccessSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  access_detail: z
    .array(
      z.object({
        menu_id: z.number().min(1),
        m_created: z.number().min(0).max(1),
        m_updated: z.number().min(0).max(1),
        m_deleted: z.number().min(0).max(1),
      }),
    )
    .min(1),
});

export const UpdateAccessSchema = z
  .object({
    id: z.number().min(1),
    status: z.number().min(0).max(1),
  })
  .merge(CreateAccessSchema);
