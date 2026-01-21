import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import usePinStore from '../store/pinStore';
import NotificationSettings from '../components/settings/NotificationSettings';
import PinSetup from '../components/pin/PinSetup';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const { isPinEnabled, disablePin } = usePinStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/me', formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatarUrl: response.data.avatarUrl });
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        <div className="card">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.[0]?.toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </label>
            </div>

            <div>
              <h2 className="text-2xl font-bold">{user?.displayName}</h2>
              <p className="text-gray-600">@{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="input"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  maxLength={150}
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/150 characters
                </p>
              </div>

              <div className="flex space-x-2">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                <p className="text-gray-900">{user?.bio || 'No bio yet'}</p>
              </div>

              <button onClick={() => setEditing(true)} className="btn-primary">
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* PIN Lock Settings */}
        <div className="card mt-6">
          <h3 className="text-xl font-bold mb-4">Privacy & Security</h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">PIN Lock</h4>
              <p className="text-sm text-gray-600">
                Protect your chats with a 4-digit PIN
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${isPinEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                {isPinEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {isPinEnabled ? (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to disable PIN lock?')) {
                      disablePin();
                      toast.success('PIN lock disabled');
                    }
                  }}
                  className="btn-secondary"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="btn-primary"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 z-50">
          <PinSetup onComplete={() => setShowPinSetup(false)} />
        </div>
      )}

      {/* Notification Settings */}
      <NotificationSettings />
    </div>
  );
};

export default Profile;
