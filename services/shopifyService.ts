import { PlatformData } from '../types';

export const ShopifyService = {
  async fetchData(storeId: string, range: 'daily' | 'weekly' | 'monthly'): Promise<PlatformData> {
    const m = range === 'daily' ? 1 : range === 'weekly' ? 7 : 30;
    const variance = () => 0.9 + Math.random() * 0.2;
    const revenue = Math.floor(250000 * m * variance());
    const orders = Math.floor(520 * m * variance());
    const aov = revenue / Math.max(orders, 1);
    const repeat = (18 + Math.random() * 6).toFixed(1) + '%';

    const points = range === 'daily' ? 8 : range === 'weekly' ? 7 : 15;
    const labels = range === 'daily'
      ? ['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00']
      : range === 'weekly'
      ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      : Array.from({ length: points }, (_, i) => `Day ${i + 1}`);

    const chartData = labels.map(label => ({
      name: label,
      value: Math.floor((revenue / points) * (0.8 + Math.random() * 0.4))
    }));

    return {
      id: 'shopify',
      metrics: [
        { label: 'Revenue', value: `KES ${revenue.toLocaleString()}`, change: '+8%', trend: 'up' },
        { label: 'Orders', value: orders.toLocaleString(), change: '+5%', trend: 'up' },
        { label: 'AOV', value: `KES ${aov.toFixed(0)}`, change: '+2%', trend: 'up' },
        { label: 'Repeat Rate', value: repeat, change: '+1%', trend: 'up' },
      ],
      chartData
    };
  }
};
