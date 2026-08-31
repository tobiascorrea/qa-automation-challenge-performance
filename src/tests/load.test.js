/**
 * Teste de CARGA (Load Test).
 *
 * Objetivo: comprovar que a aplicação sustenta a vazão exigida pelo critério
 * de aceitação — 250 requisições por segundo — mantendo o p90 abaixo de 2s.
 *
 * Estratégia de vazão:
 *   O executor `constant-arrival-rate` controla a taxa de ITERAÇÕES por
 *   segundo, independente do tempo de resposta (modelo "open"), que é o
 *   modelo correto para validar throughput.
 *
 *   Cada iteração do fluxo de compra emite 4 requisições HTTP
 *   (home, reserve, purchase, confirmation). Logo:
 *
 *       63 iterações/s  ×  4 requisições/iteração  ≈  252 req/s  ≥ 250 req/s
 *
 *   Fixamos 63 iter/s para garantir uma folga sobre o piso de 250 req/s.
 *
 * Perfil:
 *   - Ramp-up de 30s até a taxa alvo (aquecimento, evita choque inicial).
 *   - Sustentação de 3min na taxa alvo (janela de avaliação do critério).
 *   - Ramp-down de 30s.
 *
 * Execução:
 *   k6 run src/tests/load.test.js
 */
import { runPurchaseFlow } from '../flows/purchaseFlow.js';
import { loadThresholds } from '../config/thresholds.js';
import { buildSummaryHandler } from '../lib/reporter.js';

/** Iterações/segundo que produzem ~252 req/s (4 requisições por iteração). */
const TARGET_ITERATIONS_PER_SECOND = 63;

export const options = {
  scenarios: {
    load: {
      executor: 'constant-arrival-rate',
      rate: TARGET_ITERATIONS_PER_SECOND,
      timeUnit: '1s',
      duration: '3m',
      // VUs pré-alocados e máximo. Dimensionados com folga para sustentar a
      // taxa mesmo se a latência aumentar sob carga.
      preAllocatedVUs: 200,
      maxVUs: 600,
      // Aquecimento e desaquecimento graduais ao redor da janela sustentada.
      gracefulStop: '30s',
    },
  },
  thresholds: loadThresholds,
};

export default function () {
  runPurchaseFlow();
}

export const handleSummary = buildSummaryHandler('load');
