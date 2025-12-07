'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GAMES, CATEGORIES } from '@/lib/games-data';
import { useAuthStore } from '@/lib/store';
import { soundManager } from '@/lib/sound-manager';
import { 
  FaTrophy, FaCoins, FaStar, FaUser, FaCog, 
  FaSearch, FaFilter, FaPlay, FaSignOutAlt 
} from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const filteredGames = GAMES.filter(game => {
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGameClick = (gameId: string) => {
    soundManager.play('click');
    router.push(`/games/${gameId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg">
      {/* Header */}
      <header className="bg-game-card border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
                🎮 Mega Gaming Hub
              </h1>
            </motion.div>

            <div className="flex items-center space-x-6">
              <motion.div 
                className="flex items-center space-x-2 bg-yellow-600 px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <FaCoins className="text-yellow-300" />
                <span className="font-bold">{user?.coins || 0}</span>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-2 bg-purple-600 px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <FaStar className="text-yellow-300" />
                <span className="font-bold">Level {user?.level || 1}</span>
              </motion.div>

              <motion.button
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowProfile(!showProfile)}
              >
                <FaUser />
                <span>{user?.username}</span>
              </motion.button>

              <motion.button
                className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                onClick={logout}
              >
                <FaSignOutAlt />
              </motion.button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-game-card border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <FaFilter className="text-gray-400 flex-shrink-0" />
          {CATEGORIES.map((category) => (
            <motion.button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                soundManager.play('click');
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-game-card text-gray-300 hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          layout
        >
          <AnimatePresence>
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="game-card group"
                onClick={() => handleGameClick(game.id)}
              >
                <div className="relative">
                  {game.featured && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-game-bg px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 z-10">
                      <FaStar />
                      <span>Featured</span>
                    </div>
                  )}
                  
                  <div 
                    className="w-full h-40 rounded-lg flex items-center justify-center text-6xl mb-4 transition-transform group-hover:scale-110"
                    style={{ background: game.color }}
                  >
                    {game.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">
                    {game.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {game.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="bg-game-bg px-2 py-1 rounded">{game.category}</span>
                    <span className="bg-game-bg px-2 py-1 rounded capitalize">{game.difficulty}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>👥 {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}-${game.maxPlayers}`}</span>
                    <span>⏱️ {game.estimatedTime}</span>
                  </div>

                  <motion.button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaPlay />
                    <span>Play Now</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No games found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <FaTrophy className="text-5xl mx-auto mb-2 text-yellow-300" />
            <h3 className="text-2xl font-bold">{GAMES.length}</h3>
            <p className="text-gray-200">Total Games</p>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <FaCoins className="text-5xl mx-auto mb-2 text-yellow-300" />
            <h3 className="text-2xl font-bold">{user?.coins || 0}</h3>
            <p className="text-gray-200">Your Coins</p>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <FaStar className="text-5xl mx-auto mb-2 text-yellow-300" />
            <h3 className="text-2xl font-bold">{user?.level || 1}</h3>
            <p className="text-gray-200">Your Level</p>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-5xl mx-auto mb-2">🔥</div>
            <h3 className="text-2xl font-bold">{Math.floor((user?.experience || 0) / 100)}</h3>
            <p className="text-gray-200">Win Streak</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
