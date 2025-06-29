const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';
const API_PATH = '/api/v1';

const BASE_URL = `${API_BASE_URL}${API_PATH}`;

export const API = {
  LOGIN: `${BASE_URL}/auth/login`,
  USER: `${BASE_URL}/user`,
};
