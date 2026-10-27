import React from 'react';
import { APP_CONFIG } from '../config/appConfig';

interface GameFrameViewProps {
  iframeKey?: number;
}

export const GameFrameView: React.FC<GameFrameViewProps> = ({ iframeKey = 0 }) => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden z-0">
      <iframe
        key={iframeKey}
        src={APP_CONFIG.gameUrl}
        title="DKWIN9 Live Frame"
        allow="clipboard-write; autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        className="w-full h-full border-0 bg-slate-950"
      />
    </div>
  );
};
