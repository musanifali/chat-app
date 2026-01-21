import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { MessageCircle } from 'lucide-react';
import { auth } from '../config/firebase';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔥 Form submitted!', { email: formData.email });
    setLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Get Firebase token
      const firebaseToken = await userCredential.user.getIdToken();

      // Login to backend
      const response = await api.post('/auth/login', { firebaseToken });

      const { token, user } = response.data;

      // Save to store and localStorage
      setAuth(user, token);
      localStorage.setItem('token', token);

      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-12 relative overflow-hidden bg-comic-cream halftone-bg">
      <div className="w-full max-w-md animate-comic-pop">
        <div 
          className="p-6 sm:p-8 bg-white border-[4px] border-black rounded-[20px]"
          style={{
            boxShadow: '8px 8px 0 black',
            transform: 'rotate(-1deg)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 bg-comic-yellow border-[4px] border-black rounded-full animate-comic-shake"
              style={{
                boxShadow: '4px 4px 0 black',
                transform: 'rotate(5deg)'
              }}
            >
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={3} />
            </div>
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-2 text-comic-red"
              style={{
                textShadow: '3px 3px 0 black',
                WebkitTextStroke: '1px black'
              }}
            >
              💥 LOGIN! 💥
            </h1>
            <p className="font-bold text-base sm:text-lg text-gray-700">
              🎨 JUMP BACK INTO THE ACTION! 💥
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username/Email Field */}
            <div>
              <label className="block font-black uppercase text-sm mb-2 text-black">
                USERNAME OR EMAIL:
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cooluser123"
                className="w-full px-4 py-3 font-bold bg-comic-cream border-[3px] border-black rounded-xl transition-all focus:border-comic-red focus:scale-[1.02]"
                style={{
                  boxShadow: '3px 3px 0 black'
                }}
                required
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-black uppercase text-sm mb-2 text-black">
                PASSWORD:
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 font-bold bg-comic-cream border-[3px] border-black rounded-xl transition-all focus:border-comic-red focus:scale-[1.02]"
                style={{
                  boxShadow: '3px 3px 0 black'
                }}
                required
              />
            </div>

            {/* Let's Go Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-black uppercase text-lg bg-comic-red text-white border-[4px] border-black rounded-[15px] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 touch-manipulation"
              style={{
                boxShadow: loading ? '2px 2px 0 black' : '4px 4px 0 black',
                textShadow: '2px 2px 0 black',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
                WebkitTapHighlightColor: 'transparent',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ LOGGING IN...' : '⚡ LET\'S GO! ⚡'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="font-bold text-sm text-gray-700">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-black text-comic-red underline hover:scale-105 inline-block transition-transform"
              >
                SIGN UP! 🚀
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
