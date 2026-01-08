import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { UserPlus } from 'lucide-react';
import { auth } from '../config/firebase';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Get Firebase token
      const firebaseToken = await userCredential.user.getIdToken();

      // Register in backend
      const response = await api.post('/auth/register', {
        firebaseToken,
        username: formData.username,
        displayName: formData.displayName,
      });

      const { token, user } = response.data;

      // Save to store and localStorage
      setAuth(user, token);
      localStorage.setItem('token', token);

      toast.success('Registration successful! Please verify your email.');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
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
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 bg-comic-blue border-[4px] border-black rounded-full animate-comic-shake"
              style={{
                boxShadow: '4px 4px 0 black',
                transform: 'rotate(5deg)'
              }}
            >
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={3} />
            </div>
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-2 text-comic-blue"
              style={{
                textShadow: '3px 3px 0 black',
                WebkitTextStroke: '1px black'
              }}
            >
              💥 SIGN UP! 💥
            </h1>
            <p className="font-bold text-base sm:text-lg text-gray-700">
              🎨 CREATE YOUR ACCOUNT! ✨
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-black uppercase text-sm mb-2 text-black">
                EMAIL:
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 font-bold bg-comic-cream border-[3px] border-black rounded-xl transition-all focus:border-comic-blue focus:scale-[1.02]"
                style={{
                  boxShadow: '3px 3px 0 black'
                }}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block font-black uppercase text-sm mb-2 text-black">
                USERNAME:
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="cooluser123"
                pattern="[a-zA-Z0-9_]+"
                title="Only letters, numbers, and underscores"
                minLength={3}
                maxLength={20}
                className="w-full px-4 py-3 font-bold bg-comic-cream border-[3px] border-black rounded-xl transition-all focus:border-comic-blue focus:scale-[1.02]"
                style={{
                  boxShadow: '3px 3px 0 black'
                }}
                required
              />
            </div>

            <div>
              <label className="block font-black uppercase text-sm mb-2 text-black">
                DISPLAY NAME:
              </label>
              <Input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="John Doe"
                maxLength={50}
                className="w-full px-4 py-3 font-bold bg-comic-cream border-[3px] border-black rounded-xl transition-all focus:border-comic-blue focus:scale-[1.02]"
                style={{
                  boxShadow: '3px 3px 0 black'
                }}
                required
              />
            </div>

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
                minLength={8}
                className="w-full px-4 py-3 font-bold bg-comic-cream border-[3px] border-black rounded-xl transition-all focus:border-comic-blue focus:scale-[1.02]"
                style={{
                  boxShadow: '3px 3px 0 black'
                }}
                required
              />
            </div>

            <div>
              <label className="block font-black uppercase text-sm mb-2 text-black">
                CONFIRM PASSWORD:
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 font-bold bg-comic-cream border-[3px] border-black rounded-xl transition-all focus:border-comic-blue focus:scale-[1.02]"
                style={{
                  boxShadow: '3px 3px 0 black'
                }}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-black uppercase text-lg bg-comic-blue text-white border-[4px] border-black rounded-[15px] transition-all hover:scale-105 disabled:opacity-50"
              style={{
                boxShadow: loading ? '2px 2px 0 black' : '4px 4px 0 black',
                textShadow: '2px 2px 0 black',
                transform: loading ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {loading ? '⏳ CREATING ACCOUNT...' : '🚀 SIGN UP! 🚀'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="font-bold text-sm text-gray-700">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-black text-comic-blue underline hover:scale-105 inline-block transition-transform"
              >
                SIGN IN! ⚡
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
