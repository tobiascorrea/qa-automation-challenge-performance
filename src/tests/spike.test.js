import { runPurchaseFlow } from '../flows/purchaseFlow.js';
import { spikeThresholds } from '../config/thresholds.js';
import { buildSummaryHandler } from '../lib/reporter.js';

const BASELINE_RATE = 63;
const SPIKE_RATE = 150;

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: BASELINE_RATE,
      timeUnit: '1s',
      preAllocatedVUs: 300,
      maxVUs: 1200,
      stages: [
        { target: BASELINE_RATE, duration: '1m' },
        { target: SPIKE_RATE, duration: '30s' },
        { target: SPIKE_RATE, duration: '1m' },
        { target: BASELINE_RATE, duration: '30s' },
        { target: BASELINE_RATE, duration: '1m' },
      ],
      gracefulStop: '30s',
    },
  },
  thresholds: spikeThresholds,
};

export default function () {
  runPurchaseFlow();
}

export const handleSummary = buildSummaryHandler('spike');
