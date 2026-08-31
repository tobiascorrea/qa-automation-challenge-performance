/**
 * Teste de SMOKE.
 *
 * Objetivo: validar rapidamente que o fluxo de compra funciona ponta a ponta
 * antes de investir em cargas maiores. Usa 1 VU por poucas iterações.
 *
 * Execução:
 *   k6 run src/tests/smoke.test.js
 */
import { sleep } from 'k6';

import { runPurchaseFlow } from '../flows/purchaseFlow.js';
import { baseThresholds } from '../config/thresholds.js';
import { buildSummaryHandler } from '../lib/reporter.js';

export const options = {
  scenarios: {
    smoke: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 5,
      maxDuration: '1m',
    },
  },
  thresholds: baseThresholds,
};

export default function () {
  runPurchaseFlow();
  sleep(1);
}

export const handleSummary = buildSummaryHandler('smoke');
