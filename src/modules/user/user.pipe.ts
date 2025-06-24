import { z } from 'zod';

export const UserListSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().min(1)),
  limit: z.preprocess((value) => Number(value), z.number().min(1).max(100)),
  status: z.preprocess((value) => Number(value), z.number().min(0).max(1)).optional(),
  orderBy: z.string().min(1).optional(),
  sort: z.enum(['ASC', 'DESC']).optional(),
  search: z.string().min(1).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
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
