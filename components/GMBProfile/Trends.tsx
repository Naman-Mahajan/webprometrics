import React from 'react';

export const GMBTrends: React.FC<{ data: any }> = ({ data }) => (
  <div className="mb-4">
    <h4 className="font-bold text-gray-700 mb-2">Recent Trends</h4>
    {/* Render trend data as needed */}
    <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
  </div>
);
