import React from 'react';

export const GMBTable: React.FC<{ rows: any[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead>
        <tr>
          <th className="px-4 py-2 border-b">Metric</th>
          <th className="px-4 py-2 border-b">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="px-4 py-2 border-b text-sm">{row.metric}</td>
            <td className="px-4 py-2 border-b text-sm">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
