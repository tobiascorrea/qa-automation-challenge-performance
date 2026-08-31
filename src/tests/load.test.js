import { runPurchaseFlow } from '../flows/purchaseFlow.js';
import { loadThresholds } from '../config/thresholds.js';
import { buildSummaryHandler } from '../lib/reporter.js';

const TARGET_ITERATIONS_PER_SECOND = 63;

export const options = {
  scenarios: {
    load: {
      executor: 'constant-arrival-rate',
      rate: TARGET_ITERATIONS_PER_SECOND,
      timeUnit: '1s',
      duration: '3m',
      preAllocatedVUs: 200,
      maxVUs: 600,
      gracefulStop: '30s',
    },
  },
  thresholds: loadThresholds,
};

export default function () {
  runPurchaseFlow();
}

export const handleSummary = buildSummaryHandler('load');
