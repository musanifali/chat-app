import React, { useEffect, useState } from 'react';
import api from '../services/api';
import FriendList from '../components/friends/FriendList';
import FriendRequests from '../components/friends/FriendRequests';
import SearchUsers from '../components/friends/SearchUsers';
import toast from 'react-hot-toast';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests'),
      ]);

      setFriends(friendsRes.data.friends);
      setRequests(requestsRes.data.requests);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Friends</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SearchUsers onFriendAdded={fetchData} />
            <FriendList friends={friends} loading={loading} onUpdate={fetchData} />
          </div>

          <div>
            <FriendRequests requests={requests} onUpdate={fetchData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
