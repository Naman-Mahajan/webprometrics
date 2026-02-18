import React from 'react';
import { useSearchConsole } from '../../context/SearchConsoleContext';

export const ExportButton: React.FC = () => {
  const { keywords } = useSearchConsole();

  const handleExport = () => {
    if (!keywords.length) return;
    const csv = [
      ['Keyword', 'Position', 'Impressions', 'Clicks', 'Date'],
      ...keywords.map(k => [k.keyword, k.position, k.impressions, k.clicks, k.date?.slice(0,10)])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search-console-keywords.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return <button onClick={handleExport}>Export CSV</button>;
};
