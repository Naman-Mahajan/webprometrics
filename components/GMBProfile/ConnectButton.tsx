import React from 'react';
import { Button } from '../Button';

export const GMBConnectButton: React.FC<{ onConnect: () => void; connecting: boolean; connected: boolean }> = ({ onConnect, connecting, connected }) => (
  <Button
    size="sm"
    variant={connected ? 'outline' : 'primary'}
    onClick={onConnect}
    disabled={connecting || connected}
  >
    {connected ? 'Connected' : connecting ? 'Connecting...' : 'Connect Google My Business'}
  </Button>
);
