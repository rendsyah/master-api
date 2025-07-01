const users = [
  { user: 'admin-1', password: 'admin' },
  { user: 'admin-2', password: 'admin' },
  { user: 'admin-3', password: 'admin' },
  { user: 'admin-4', password: 'admin' },
  { user: 'admin-5', password: 'admin' },
  { user: 'admin-6', password: 'admin' },
  { user: 'admin-7', password: 'admin' },
  { user: 'admin-8', password: 'admin' },
  { user: 'admin-9', password: 'admin' },
  { user: 'admin-10', password: 'admin' },
];

export const loginRequest = (vu) => {
  const user = users[(vu - 1) % users.length];
  return JSON.stringify({
    user: user.user,
    password: user.password,
    device: {
      firebase_id: 'dummy_firebase_id',
      device_browser: 'Chrome',
      device_browser_version: '113',
      device_imei: 'dummy_imei',
      device_model: 'Macbook Pro',
      device_type: 'laptop',
      device_vendor: 'Apple',
      device_os: 'MacOS',
      device_os_version: '13',
      device_platform: 'Web',
      user_agent: 'Mozilla/5.0',
      app_version: '1.0.0',
    },
  });
};
