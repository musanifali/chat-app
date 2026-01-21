import React, { useState, useEffect } from 'react';
import offlineService from '../../services/offlineService';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(offlineService.checkOnlineStatus());
  const [queuedCount, setQueuedCount] = useState(offlineService.getQueuedCount());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineService.subscribe((event, data) => {
      switch (event) {
        case 'online':
          setIsOnline(true);
          break;
        case 'offline':
          setIsOnline(false);
          break;
        case 'processing-queue':
          setIsProcessing(true);
          break;
        case 'queue-processed':
          setIsProcessing(false);
          setQueuedCount(offlineService.getQueuedCount());
          break;
        default:
          break;
      }
    });

    // Update queued count every second
    const interval = setInterval(() => {
      setQueuedCount(offlineService.getQueuedCount());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (isOnline && queuedCount === 0 && !isProcessing) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-50 animate-comic-pop"
      style={{
        maxWidth: '300px',
      }}
    >
      {!isOnline ? (
        <div
          className="px-4 py-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: '#ff0000',
            border: '3px solid black',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: 'white' }}
            />
            <span className="font-black text-white uppercase">
              📵 You're Offline
            </span>
          </div>
          {queuedCount > 0 && (
            <p className="text-xs font-bold text-white mt-1">
              {queuedCount} message{queuedCount !== 1 ? 's' : ''} queued
            </p>
          )}
        </div>
      ) : isProcessing ? (
        <div
          className="px-4 py-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: '#FFD700',
            border: '3px solid black',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="animate-spin">⚙️</div>
            <span className="font-black uppercase">
              Sending Queued Messages...
            </span>
          </div>
        </div>
      ) : queuedCount > 0 ? (
        <div
          className="px-4 py-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: '#00D9FF',
            border: '3px solid black',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-black uppercase">
              📦 {queuedCount} Queued Message{queuedCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs font-bold mt-1">
            Will send when connection is restored
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
