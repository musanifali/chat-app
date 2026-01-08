import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      style={{
        backgroundColor: '#ffff00',
        borderBottom: '4px solid black',
        boxShadow: '0 4px 0 black',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '4px 4px'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              to="/" 
              className="text-lg sm:text-2xl font-black uppercase"
              style={{
                color: 'black',
                textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                transform: 'rotate(-1deg)',
                letterSpacing: '0.05em'
              }}
            >
              <span className="hidden sm:inline">💬 FRIENDCHAT</span>
              <span className="sm:hidden">💬 CHAT</span>
            </Link>

            <div className="flex gap-1 sm:gap-2">
              <Link
                to="/"
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase transition-all"
                style={{
                  backgroundColor: isActive('/') ? '#00ffff' : 'white',
                  color: 'black',
                  border: '2px solid black',
                  borderRadius: '8px',
                  boxShadow: isActive('/') ? '2px 2px 0 black' : 'none',
                  transform: isActive('/') ? 'rotate(-0.5deg)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.backgroundColor = '#ffff00';
                    e.currentTarget.style.transform = 'rotate(0.5deg) scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                <span className="hidden sm:inline">💬 CHATS</span>
                <span className="sm:hidden">💬</span>
              </Link>
              <Link
                to="/friends"
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase transition-all"
                style={{
                  backgroundColor: isActive('/friends') ? '#00ffff' : 'white',
                  color: 'black',
                  border: '2px solid black',
                  borderRadius: '8px',
                  boxShadow: isActive('/friends') ? '2px 2px 0 black' : 'none',
                  transform: isActive('/friends') ? 'rotate(-0.5deg)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/friends')) {
                    e.currentTarget.style.backgroundColor = '#ffff00';
                    e.currentTarget.style.transform = 'rotate(0.5deg) scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/friends')) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                <span className="hidden sm:inline">👥 FRIENDS</span>
                <span className="sm:hidden">👥</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              to="/profile" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 transition-all"
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffff00';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div 
                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-white font-black overflow-hidden flex-shrink-0"
                style={{
                  backgroundColor: '#ff0000',
                  border: '2px solid black',
                  boxShadow: '2px 2px 0 black'
                }}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs sm:text-sm">{user?.displayName?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold hidden md:inline truncate max-w-[100px]">{user?.displayName}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase transition-all hover:scale-105"
              style={{
                backgroundColor: '#ff0000',
                color: 'white',
                border: '3px solid black',
                borderRadius: '8px',
                boxShadow: '3px 3px 0 black',
                textShadow: '1px 1px 0 black'
              }}
            >
              <span className="hidden sm:inline">🚪 LOGOUT</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
