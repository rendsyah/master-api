import http from 'k6/http';
import { check, sleep } from 'k6';

import { API } from '../utils/api.js';

import { loginSingleRequest } from '../utils/login.js';
import { loadOptions } from '../options/user.js';

export const options = loadOptions;

export const setup = () => {
  const user = loginSingleRequest();

  const headers = { 'Content-Type': 'application/json' };

  const res = http.post(API.LOGIN, user, { headers });
  const json = res.json();

  return {
    access_token: json.data.access_token,
  };
};

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.access_token}`,
  };

  const res = http.get(API.USER, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
