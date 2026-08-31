import http from 'k6/http';
import { check, group } from 'k6';

import { environment, endpoints, pageMarkers } from '../config/environment.js';
import {
  departureCities,
  destinationCities,
  paymentProfile,
  pickRandom,
} from '../data/testData.js';
import { extractFirstFlight } from '../lib/parsers.js';
import {
  purchaseSuccess,
  purchaseFlowDuration,
  purchasesCompleted,
} from '../lib/metrics.js';

const FORM_HEADERS = {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
};

export function runPurchaseFlow() {
  const journeyStart = Date.now();
  let completed = false;

  group('Compra de passagem aérea', () => {
    const home = http.get(`${environment.baseUrl}${endpoints.home}`, {
      tags: { step: '01_home' },
    });
    const homeOk = check(home, {
      'home: status 200': (r) => r.status === 200,
      'home: página carregada': (r) => r.body && r.body.includes(pageMarkers.home),
    });
    if (!homeOk) {
      return finish(false, journeyStart);
    }

    const fromPort = pickRandom(departureCities);
    const toPort = pickRandom(destinationCities);
    const reserve = http.post(
      `${environment.baseUrl}${endpoints.reserve}`,
      { fromPort, toPort },
      { ...FORM_HEADERS, tags: { step: '02_reserve' } },
    );
    const reserveOk = check(reserve, {
      'reserve: status 200': (r) => r.status === 200,
      'reserve: lista de voos exibida': (r) =>
        r.body && r.body.includes(pageMarkers.reserve),
    });
    if (!reserveOk) {
      return finish(false, journeyStart);
    }

    const flight = extractFirstFlight(reserve.body);
    if (!flight) {
      return finish(false, journeyStart);
    }

    const purchase = http.post(
      `${environment.baseUrl}${endpoints.purchase}`,
      { fromPort, toPort, ...flight },
      { ...FORM_HEADERS, tags: { step: '03_purchase' } },
    );
    const purchaseOk = check(purchase, {
      'purchase: status 200': (r) => r.status === 200,
      'purchase: formulário de pagamento exibido': (r) =>
        r.body && r.body.includes(pageMarkers.purchase),
    });
    if (!purchaseOk) {
      return finish(false, journeyStart);
    }

    const confirmation = http.post(
      `${environment.baseUrl}${endpoints.confirmation}`,
      { ...paymentProfile },
      { ...FORM_HEADERS, tags: { step: '04_confirmation' } },
    );
    const confirmationOk = check(confirmation, {
      'confirmation: status 200': (r) => r.status === 200,
      'confirmation: compra concluída com sucesso': (r) =>
        r.body && r.body.includes(pageMarkers.confirmation),
    });

    completed = confirmationOk;
    finish(completed, journeyStart);
  });

  return completed;
}

function finish(success, journeyStart) {
  purchaseSuccess.add(success);
  purchaseFlowDuration.add(Date.now() - journeyStart);
  if (success) {
    purchasesCompleted.add(1);
  }
  return success;
}
