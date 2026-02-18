import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../services/api';

interface Keyword {
  keyword: string;
  position: number;
  impressions: number;
  clicks: number;
  date: string;
}

interface SearchConsoleContextType {
  keywords: Keyword[];
  fetchKeywords: (filters?: any) => Promise<void>;
  loading: boolean;
}

const SearchConsoleContext = createContext<SearchConsoleContextType | undefined>(undefined);

export const SearchConsoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKeywords = async (filters?: any) => {
    setLoading(true);
    try {
      // Example: fetch for a site and dateRange
      const siteUrl = filters?.siteUrl || '';
      const dateRange = filters?.dateRange || 'daily';
      const resp = await api.get<{ history: any[] }>(`/google/search-console/history?siteUrl=${encodeURIComponent(siteUrl)}&dateRange=${dateRange}`);
      // Flatten and map to Keyword[]
      const allRows = resp.history.flatMap(h => (h.data.rows || []).map((row: any) => ({
        keyword: (row.keys && row.keys[0]) || '',
        position: row.position,
        impressions: row.impressions,
        clicks: row.clicks,
        date: h.fetchedAt
      })));
      setKeywords(allRows);
    } catch (e) {
      setKeywords([]);
    }
    setLoading(false);
  };

  return (
    <SearchConsoleContext.Provider value={{ keywords, fetchKeywords, loading }}>
      {children}
    </SearchConsoleContext.Provider>
  );
};

export const useSearchConsole = () => {
  const ctx = useContext(SearchConsoleContext);
  if (!ctx) throw new Error('useSearchConsole must be used within SearchConsoleProvider');
  return ctx;
};
