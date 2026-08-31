/**
 * Geração de relatórios de execução.
 *
 * Usa o utilitário oficial `handleSummary` do k6 para produzir:
 *   - Um relatório HTML visual e conciso (via k6-reporter da comunidade).
 *   - Um resumo JSON completo (para inspeção programática / CI).
 *   - O resumo textual padrão no stdout (visão rápida no terminal).
 *
 * O caminho de saída inclui o nome do cenário para não sobrescrever
 * relatórios de execuções diferentes (load vs spike).
 */
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

/**
 * Cria uma função `handleSummary` para um cenário específico.
 *
 * @param {string} scenarioName Nome usado nos arquivos de saída (ex.: "load").
 * @returns {(data: object) => object} handler compatível com o k6.
 */
export function buildSummaryHandler(scenarioName) {
  return function handleSummary(data) {
    const htmlPath = `reports/${scenarioName}-report.html`;
    const jsonPath = `reports/${scenarioName}-summary.json`;

    return {
      [htmlPath]: htmlReport(data, {
        title: `BlazeDemo Performance — ${scenarioName.toUpperCase()}`,
      }),
      [jsonPath]: JSON.stringify(data, null, 2),
      stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
  };
}
