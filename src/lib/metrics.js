/**
 * Métricas customizadas de negócio.
 *
 * Além das métricas nativas do k6 (http_req_duration, http_reqs, etc.),
 * expomos indicadores voltados ao domínio do teste — compra concluída e
 * duração ponta a ponta da jornada — que aparecem no resumo e no relatório.
 */
import { Rate, Trend, Counter } from 'k6/metrics';

/** Taxa de compras concluídas com sucesso (chega à página de confirmação). */
export const purchaseSuccess = new Rate('purchase_success');

/** Duração total da jornada de compra (soma das 4 etapas), em ms. */
export const purchaseFlowDuration = new Trend('purchase_flow_duration', true);

/** Contador absoluto de compras concluídas. */
export const purchasesCompleted = new Counter('purchases_completed');
