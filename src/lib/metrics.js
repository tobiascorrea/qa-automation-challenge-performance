import { Rate, Trend, Counter } from 'k6/metrics';

export const purchaseSuccess = new Rate('purchase_success');

export const purchaseFlowDuration = new Trend('purchase_flow_duration', true);

export const purchasesCompleted = new Counter('purchases_completed');
