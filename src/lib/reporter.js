import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const REPORT_DIR = (__ENV.REPORT_DIR || 'reports').replace(/\/+$/, '');

export function buildSummaryHandler(scenarioName) {
  return function handleSummary(data) {
    const htmlPath = `${REPORT_DIR}/${scenarioName}-report.html`;
    const jsonPath = `${REPORT_DIR}/${scenarioName}-summary.json`;

    return {
      [htmlPath]: htmlReport(data, {
        title: `BlazeDemo Performance — ${scenarioName.toUpperCase()}`,
      }),
      [jsonPath]: JSON.stringify(data, null, 2),
      stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
  };
}
