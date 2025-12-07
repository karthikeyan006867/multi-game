'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { soundManager } from '@/lib/sound-manager';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.play('click');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        soundManager.play('achievement');
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        router.push('/');
      } else {
        toast.error(data.error || 'Something went wrong');
        soundManager.play('error');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      soundManager.play('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-bg via-purple-900 to-game-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎮
          </motion.h1>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
            Mega Gaming Hub
          </h2>
          <p className="text-gray-400 mt-2">30+ Amazing Games to Play!</p>
        </div>

        <div className="glass-effect p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-l-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-game-card text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-r-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-game-card text-gray-400'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-game-card border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                  placeholder="Choose a username"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-game-card border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-game-card border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLogin ? 'Login' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Demo Account:</p>
            <p>Email: demo@gaming.com | Password: demo123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
