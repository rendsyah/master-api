import { z } from 'zod';

export const LoginSchema = z.object({
  user: z.string().min(1),
  password: z.string().min(1),
  device: z.object({
    firebase_id: z.string(),
    device_browser: z.string(),
    device_browser_version: z.string(),
    device_imei: z.string(),
    device_model: z.string(),
    device_type: z.string(),
    device_vendor: z.string(),
    device_os: z.string(),
    device_os_version: z.string(),
    device_platform: z.enum(['Web', 'Mobile']),
    user_agent: z.string(),
    app_version: z.string().min(1),
  }),
});
