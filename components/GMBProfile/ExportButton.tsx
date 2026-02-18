import React from 'react';
import { Button } from '../Button';

export const GMBExportButton: React.FC<{ onExport: () => void }> = ({ onExport }) => (
  <Button size="sm" variant="outline" onClick={onExport}>
    Export CSV
  </Button>
);
