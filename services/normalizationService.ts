import { PlatformData, UnifiedMetric } from '../types';

const metricMap: Record<string, UnifiedMetric> = {
  revenue: { key: 'revenue', label: 'Revenue', unit: 'KES' },
  orders: { key: 'orders', label: 'Orders', unit: '' },
  aov: { key: 'aov', label: 'Average Order Value', unit: 'KES' },
  repeat_rate: { key: 'repeat_rate', label: 'Repeat Rate', unit: '%' },
  deals_created: { key: 'deals_created', label: 'Deals Created', unit: '' },
  deals_won: { key: 'deals_won', label: 'Deals Won', unit: '' },
  pipeline_value: { key: 'pipeline_value', label: 'Pipeline Value', unit: 'KES' },
  win_rate: { key: 'win_rate', label: 'Win Rate', unit: '%' },
  avg_cycle: { key: 'avg_cycle', label: 'Avg Sales Cycle (days)', unit: 'days' }
};

export function normalizeShopify(data: PlatformData) {
  return {
    platform: 'Shopify',
    metrics: [
      { ...metricMap.revenue, value: extractNumber(data.metrics[0]?.value) },
      { ...metricMap.orders, value: extractNumber(data.metrics[1]?.value) },
      { ...metricMap.aov, value: extractNumber(data.metrics[2]?.value) },
      { ...metricMap.repeat_rate, value: extractPercent(data.metrics[3]?.value) }
    ],
    chart: data.chartData
  };
}

export function normalizeHubSpot(data: PlatformData) {
  return {
    platform: 'HubSpot CRM',
    metrics: [
      { ...metricMap.deals_created, value: extractNumber(data.metrics[0]?.value) },
      { ...metricMap.deals_won, value: extractNumber(data.metrics[1]?.value) },
      { ...metricMap.pipeline_value, value: extractNumber(data.metrics[2]?.value) },
      { ...metricMap.win_rate, value: extractPercent(data.metrics[3]?.value) },
      { ...metricMap.avg_cycle, value: extractNumber(data.metrics[4]?.value) }
    ],
    chart: data.chartData
  };
}

function extractNumber(input?: string | number | null) {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  const parsed = parseFloat(String(input).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractPercent(input?: string | number | null) {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  const parsed = parseFloat(String(input).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
