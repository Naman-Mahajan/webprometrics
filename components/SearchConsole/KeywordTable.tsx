import React from 'react';
import { useSearchConsole } from '../../context/SearchConsoleContext';

export const KeywordTable: React.FC = () => {
  const { keywords, loading } = useSearchConsole();

  if (loading) return <div>Loading keywords...</div>;
  if (!keywords.length) return <div>No keyword data available.</div>;

  return (
    <div>
      <h3>Keyword Table</h3>
      <table>
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Position</th>
            <th>Impressions</th>
            <th>Clicks</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {keywords.map((k, i) => (
            <tr key={i}>
              <td>{k.keyword}</td>
              <td>{k.position}</td>
              <td>{k.impressions}</td>
              <td>{k.clicks}</td>
              <td>{k.date?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
