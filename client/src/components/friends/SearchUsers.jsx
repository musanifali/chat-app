import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SearchUsers = ({ onFriendAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = async (value) => {
    setQuery(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/search?q=${value}`);
        setResults(response.data.users);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSendRequest = async (userId) => {
    try {
      await api.post('/friends/request', { userId });
      toast.success('Friend request sent');
      setResults(results.filter((user) => user._id !== userId));
      onFriendAdded?.();
    } catch (error) {
      console.error('Send request error:', error);
      toast.error(error.response?.data?.error || 'Failed to send request');
    }
  };

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
      <h2 className="text-2xl font-black mb-4 uppercase">🔍 FIND FRIENDS</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by username or email..."
        className="w-full px-4 py-3 mb-4 font-bold focus:outline-none transition-all"
        style={{
          backgroundColor: '#fff5e6',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '3px 3px 0 black'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0066ff';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'black';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />

      {loading && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-black rounded-full animate-bounce"></div>
          <p className="text-sm font-bold">SEARCHING...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((user) => (
            <div 
              key={user._id} 
              className="flex items-center justify-between p-3 animate-comic-pop"
              style={{
                backgroundColor: '#fff5e6',
                border: '2px solid black',
                borderRadius: '8px'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-black overflow-hidden"
                  style={{
                    backgroundColor: '#9B59B6',
                    border: '2px solid black',
                    boxShadow: '2px 2px 0 black'
                  }}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-black">{user.displayName}</p>
                  <p className="text-sm font-bold" style={{ color: '#666' }}>@{user.username}</p>
                </div>
              </div>

              <button
                onClick={() => handleSendRequest(user._id)}
                className="text-sm px-4 py-2 font-black uppercase transition-all hover:scale-105"
                style={{
                  backgroundColor: '#00D9FF',
                  color: 'black',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '3px 3px 0 black',
                  textShadow: '1px 1px 0 black'
                }}
              >
                ➕ ADD
              </button>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center py-6">
          <div className="text-6xl mb-3">😕</div>
          <p className="text-base font-bold">No users found</p>
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
