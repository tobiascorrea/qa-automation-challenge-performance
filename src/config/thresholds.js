export const P90_LIMIT_MS = 2000;

export const REQUIRED_RPS = 250;

export const baseThresholds = {
  http_req_duration: [`p(90)<${P90_LIMIT_MS}`],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.99'],
  purchase_success: ['rate>0.99'],
};

export const loadThresholds = {
  ...baseThresholds,
  http_reqs: [`rate>=${REQUIRED_RPS}`],
};

export const spikeThresholds = {
  http_req_failed: [{ threshold: 'rate<1', abortOnFail: false }],
  checks: [{ threshold: 'rate>0', abortOnFail: false }],
};
