import React from 'react';
import { api } from '../../services/api';

export const ConnectButton: React.FC = () => {
  const handleConnect = async () => {
    // Get OAuth URL from backend and redirect
    const resp = await api.get<{ url: string }>(`/oauth/google/start?scope=searchconsole`);
    if (resp.url) window.open(resp.url, '_blank');
  };
  return (
    <button onClick={handleConnect}>Connect Google Search Console</button>
  );
};
