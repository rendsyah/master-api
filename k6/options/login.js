export const loadOptions = {
  scenarios: {
    login_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export const spikeOptions = {
  scenarios: {
    login_spike: {
      executor: 'constant-arrival-rate',
      duration: '30s',
      rate: 200,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.05'],
  },
};

export const stressOptions = {
  scenarios: {
    login_stress: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1000,
      stages: [
        { target: 100, duration: '30s' },
        { target: 300, duration: '30s' },
        { target: 600, duration: '30s' },
        { target: 1000, duration: '30s' },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};
