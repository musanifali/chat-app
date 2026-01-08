import React from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FriendRequests = ({ requests, onUpdate }) => {
  const handleRespond = async (requestId, action) => {
    try {
      await api.put(`/friends/request/${requestId}`, { action });
      toast.success(`Request ${action}ed`);
      onUpdate?.();
    } catch (error) {
      console.error('Respond error:', error);
      toast.error('Failed to respond to request');
    }
  };

  if (requests.length === 0) {
    return (
      <div 
        className="p-6 text-center"
        style={{
          backgroundColor: 'white',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black'
        }}
      >
        <h2 className="text-2xl font-black mb-4 uppercase">📨 FRIEND REQUESTS</h2>
        <div className="text-6xl mb-3">📭</div>
        <p className="text-base font-bold">No pending requests</p>
      </div>
    );
  }

  return (
    <div 
      className="p-6"
      style={{
        backgroundColor: 'white',
        border: '3px solid black',
        borderRadius: '12px',
        boxShadow: '4px 4px 0 black'
      }}
    >
      <h2 className="text-2xl font-black mb-4 uppercase">
        📨 FRIEND REQUESTS ({requests.length})
      </h2>

      <div className="space-y-3">
        {requests.map((request) => (
          <div 
            key={request._id} 
            className="p-4 animate-comic-pop"
            style={{
              backgroundColor: '#fff5e6',
              border: '2px solid black',
              borderRadius: '8px',
              transform: 'rotate(-0.5deg)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center text-white font-black overflow-hidden"
                style={{
                  backgroundColor: '#0066ff',
                  border: '3px solid black',
                  boxShadow: '2px 2px 0 black'
                }}
              >
                {request.from.avatarUrl ? (
                  <img src={request.from.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  request.from.displayName[0].toUpperCase()
                )}
              </div>
              <div>
                <p className="font-black uppercase">{request.from.displayName}</p>
                <p className="text-sm font-bold" style={{ color: '#666' }}>@{request.from.username}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleRespond(request._id, 'accept')}
                className="flex-1 py-2 text-sm font-black uppercase transition-all hover:scale-105"
                style={{
                  backgroundColor: '#00ff00',
                  color: 'black',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '3px 3px 0 black',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.2)'
                }}
              >
                ✅ ACCEPT
              </button>
              <button
                onClick={() => handleRespond(request._id, 'decline')}
                className="flex-1 py-2 text-sm font-black uppercase transition-all hover:scale-105"
                style={{
                  backgroundColor: '#ff0000',
                  color: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '3px 3px 0 black',
                  textShadow: '1px 1px 0 black'
                }}
              >
                ❌ DECLINE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;
