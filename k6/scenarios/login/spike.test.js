import http from 'k6/http';
import { check } from 'k6';

import { API } from '../../utils/api.js';

import { loginRequest } from '../../utils/login.js';
import { spikeOptions } from '../../options/login.js';

export const options = spikeOptions;

export default function () {
  const users = loginRequest(__VU);

  const headers = { 'Content-Type': 'application/json' };

  const res = http.post(API.LOGIN, users, { headers });

  check(res, {
    'status is 201': (r) => r.status === 201,
  });
}
