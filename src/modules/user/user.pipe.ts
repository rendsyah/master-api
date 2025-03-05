import { z } from 'zod';

export const CreateAccessSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  permission: z.number().min(0).max(1),
  access_detail: z
    .array(
      z.object({
        menu_id: z.number().min(1),
        m_created: z.number().min(0).max(1),
        m_view: z.number().min(0).max(1),
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
