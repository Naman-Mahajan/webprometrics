import React, { createContext, useContext, useState, useCallback } from 'react';

interface GMBProfileData {
  connected: boolean;
  connecting: boolean;
  businessData: any;
  trends: any[];
  tableRows: any[];
  chartData: any[];
}

const GMBProfileContext = createContext<any>(null);

export const useGMBProfile = () => useContext(GMBProfileContext);

export const GMBProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GMBProfileData>({
    connected: false,
    connecting: false,
    businessData: null,
    trends: [],
    tableRows: [],
    chartData: [],
  });

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true }));
    // TODO: Implement OAuth and fetch logic
    setTimeout(() => {
      setState(s => ({ ...s, connected: true, connecting: false, businessData: { name: 'Demo Business' }, trends: [{ name: 'Views', value: 1200 }], tableRows: [{ metric: 'Views', value: 1200 }], chartData: [{ name: 'Mon', value: 200 }, { name: 'Tue', value: 300 }] }));
    }, 1500);
  }, []);

  const exportCSV = useCallback(() => {
    // TODO: Implement CSV export
    alert('Exporting CSV...');
  }, []);

  return (
    <GMBProfileContext.Provider value={{ ...state, connect, exportCSV }}>
      {children}
    </GMBProfileContext.Provider>
  );
};
