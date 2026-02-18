import { PlatformData } from '../types';

export const HubSpotService = {
  async fetchData(portalId: string, range: 'daily' | 'weekly' | 'monthly'): Promise<PlatformData> {
    const variance = () => 0.9 + Math.random() * 0.2;
    const dealsCreated = Math.floor((range === 'daily' ? 12 : range === 'weekly' ? 75 : 320) * variance());
    const dealsWon = Math.floor(dealsCreated * (0.32 + Math.random() * 0.08));
    const pipelineValue = Math.floor(dealsCreated * 15000 * variance());
    const winRate = dealsCreated === 0 ? '0%' : `${((dealsWon / dealsCreated) * 100).toFixed(1)}%`;
    const avgCycle = range === 'daily' ? 14 : range === 'weekly' ? 17 : 21;

    const points = range === 'daily' ? 8 : range === 'weekly' ? 7 : 15;
    const labels = range === 'daily'
      ? ['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00']
      : range === 'weekly'
      ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      : Array.from({ length: points }, (_, i) => `Day ${i + 1}`);

    const chartData = labels.map(label => ({
      name: label,
      value: Math.floor((dealsCreated / points) * (0.8 + Math.random() * 0.4))
    }));

    return {
      id: 'hubspot',
      metrics: [
        { label: 'Deals Created', value: dealsCreated.toLocaleString(), change: '+6%', trend: 'up' },
        { label: 'Deals Won', value: dealsWon.toLocaleString(), change: '+4%', trend: 'up' },
        { label: 'Pipeline Value', value: `KES ${pipelineValue.toLocaleString()}`, change: '+7%', trend: 'up' },
        { label: 'Win Rate', value: winRate, change: '+1%', trend: 'up' },
        { label: 'Avg Cycle (days)', value: avgCycle.toFixed(0), change: '-1', trend: 'down' }
      ],
      chartData
    };
  }
};
