/**
 * Teste de PICO (Spike Test).
 *
 * Objetivo: avaliar o comportamento da aplicação diante de um aumento abrupto
 * de tráfego bem acima do critério de aceitação, e sua capacidade de
 * recuperação após o pico.
 *
 * Estratégia de vazão:
 *   Usa `ramping-arrival-rate` para variar a taxa de iterações ao longo do
 *   tempo. Como cada iteração emite 4 requisições HTTP, a coluna à direita
 *   mostra a vazão aproximada resultante:
 *
 *       Estágio                 iter/s   →   req/s (aprox.)
 *       baseline (1min)           63     →     252
 *       subida súbita (30s)      150     →     600
 *       pico sustentado (1min)   150     →     600
 *       recuperação (30s)         63     →     252
 *       normalização (1min)       63     →     252
 *
 * Durante o pico o sistema é deliberadamente pressionado acima do critério
 * para observar degradação; por isso os thresholds de erro são mais tolerantes
 * (ver spikeThresholds), mas o p90 < 2s permanece como referência.
 *
 * Execução:
 *   k6 run src/tests/spike.test.js
 */
import { runPurchaseFlow } from '../flows/purchaseFlow.js';
import { spikeThresholds } from '../config/thresholds.js';
import { buildSummaryHandler } from '../lib/reporter.js';

const BASELINE_RATE = 63; // ~252 req/s
const SPIKE_RATE = 150; // ~600 req/s

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: BASELINE_RATE,
      timeUnit: '1s',
      preAllocatedVUs: 300,
      maxVUs: 1200,
      stages: [
        { target: BASELINE_RATE, duration: '1m' }, // baseline
        { target: SPIKE_RATE, duration: '30s' }, // subida abrupta
        { target: SPIKE_RATE, duration: '1m' }, // pico sustentado
        { target: BASELINE_RATE, duration: '30s' }, // recuperação
        { target: BASELINE_RATE, duration: '1m' }, // normalização
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
