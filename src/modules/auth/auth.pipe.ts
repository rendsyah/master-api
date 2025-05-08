import { z } from 'zod';

export const LoginSchema = z.object({
  user: z.string().min(1),
  password: z.string().min(1),
  device: z.object({
    firebase_id: z.string(),
    device_imei: z.string(),
    device_name: z.string(),
    device_os: z.string(),
    device_platform: z.enum(['Web', 'Mobile']),
    app_version: z.string().min(1),
  }),
});

export const PermissionSchema = z.object({
  path: z
    .string()
    .min(1)
    .regex(/^\/[a-zA-Z0-9-_]+(\/[a-zA-Z0-9-_]+)*$/),
});
