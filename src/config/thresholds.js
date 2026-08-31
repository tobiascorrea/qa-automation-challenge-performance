/**
 * Thresholds (critérios de aceitação) do teste de performance.
 *
 * Critério oficial do desafio:
 *   - Vazão de 250 requisições por segundo.
 *   - Tempo de resposta no percentil 90 (p90) inferior a 2 segundos.
 *
 * Os thresholds abaixo transformam esse critério em condições objetivas que
 * fazem o k6 encerrar com código de saída diferente de zero quando violadas,
 * permitindo reprovar o build automaticamente no CI.
 */

/** Limite do p90 em milissegundos, conforme critério de aceitação. */
export const P90_LIMIT_MS = 2000;

/** Vazão mínima exigida em requisições por segundo. */
export const REQUIRED_RPS = 250;

/**
 * Thresholds compartilhados entre os cenários.
 *
 * - `http_req_duration`: valida diretamente o p90 < 2s (requisito principal).
 * - `http_req_failed`: mantém a taxa de erro sob controle (< 1%).
 * - `checks`: garante que as validações funcionais do fluxo passem (> 99%).
 * - `http_reqs`: valida a vazão média agregada exigida pelo critério.
 * - `purchase_success`: métrica de negócio própria (compra concluída).
 */
export const baseThresholds = {
  http_req_duration: [`p(90)<${P90_LIMIT_MS}`],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.99'],
  purchase_success: ['rate>0.99'],
};

/**
 * Thresholds específicos do teste de carga. Além dos compartilhados, exige
 * que a vazão média fique igual ou acima do critério de 250 req/s.
 */
export const loadThresholds = {
  ...baseThresholds,
  http_reqs: [`rate>=${REQUIRED_RPS}`],
};

/**
 * Thresholds do teste de pico. Durante o pico o sistema é levado além do
 * ponto de conforto, então mantemos o critério de p90, mas relaxamos taxa de
 * erro para observar (e não mascarar) a degradação sob estresse.
 */
export const spikeThresholds = {
  http_req_duration: [`p(90)<${P90_LIMIT_MS}`],
  http_req_failed: ['rate<0.05'],
  checks: ['rate>0.95'],
};
