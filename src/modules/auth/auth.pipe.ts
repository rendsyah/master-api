import { z } from 'zod';

export const LoginSchema = z.object({
  user: z.string(),
  password: z.string(),
  device: z.object({
    firebase_id: z.string(),
    device_imei: z.string(),
    device_name: z.string(),
    device_os: z.string(),
    device_platform: z.enum(['Mobile', 'Web']),
    app_version: z.string(),
  }),
});
