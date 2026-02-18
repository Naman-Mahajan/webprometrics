import React, { useEffect } from 'react';
import { useSearchConsole } from '../../context/SearchConsoleContext';

export const KeywordTrends: React.FC<{ siteUrl: string }> = ({ siteUrl }) => {
  const { fetchKeywords } = useSearchConsole();

  useEffect(() => {
    fetchKeywords({ siteUrl, dateRange: 'daily' });
  }, [siteUrl]);

  return (
    <div>
      <h2>Keyword Ranking Trends</h2>
      {/* TODO: Add chart here using chart library */}
    </div>
  );
};
