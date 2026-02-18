import React from 'react';
import { useSearchConsole } from '../../context/SearchConsoleContext';
// You can swap for Chart.js, Recharts, etc. For now, a simple SVG line chart

export const KeywordTrendsChart: React.FC = () => {
  const { keywords } = useSearchConsole();
  if (!keywords.length) return <div>No data for chart.</div>;
  // Group by date, average position
  const grouped = keywords.reduce((acc, k) => {
    const d = k.date.slice(0,10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(k.position);
    return acc;
  }, {} as Record<string, number[]>);
  const data = Object.entries(grouped).map(([date, posArr]) => {
    const arr = posArr as number[];
    return { date, avg: arr.reduce((a, b) => a + b, 0) / arr.length };
  });
  if (data.length < 2) return <div>Not enough data for chart.</div>;
  // SVG line chart (simple)
  const w = 320, h = 120, pad = 24;
  const min = Math.min(...data.map(d=>d.avg)), max = Math.max(...data.map(d=>d.avg));
  const points = data.map((d,i) => [pad + i*(w-2*pad)/(data.length-1), h-pad-((d.avg-min)/(max-min||1))*(h-2*pad)]);
  return (
    <svg width={w} height={h} className="keyword-trends-chart-bg">
      <polyline fill="none" stroke="#0074d9" strokeWidth="2" points={points.map(p=>p.join(",")).join(' ')} />
      {points.map((p,i)=>(<circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#0074d9" />))}
      <text x={pad} y={h-4} fontSize="10">{data[0].date}</text>
      <text x={w-pad-24} y={h-4} fontSize="10" textAnchor="end">{data[data.length-1].date}</text>
      <text x={pad} y={pad} fontSize="10">Avg. Position</text>
    </svg>
  );
};
