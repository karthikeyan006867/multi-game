const fs = require('fs');
const path = require('path');

const games = [
  { id: 'match3', name: 'Candy Crush', icon: '🍬', color: 'pink' },
  { id: 'crossword', name: 'Crossword Challenge', icon: '📝', color: 'green' },
  { id: 'chess', name: 'Chess Master', icon: '♟️', color: 'gray' },
  { id: 'checkers', name: 'Checkers Champion', icon: '🔴', color: 'red' },
  { id: 'connect4', name: 'Connect Four', icon: '🔵', color: 'blue' },
  { id: 'pacman', name: 'Pac-Man Deluxe', icon: '👻', color: 'yellow' },
  { id: 'spaceinvaders', name: 'Space Invaders', icon: '👾', color: 'purple' },
  { id: 'flappybird', name: 'Flappy Bird', icon: '🐦', color: 'cyan' },
  { id: 'templerun', name: 'Temple Run', icon: '🏃', color: 'orange' },
  { id: 'subwaysurfers', name: 'Subway Surfers', icon: '🚇', color: 'teal' },
  { id: 'shadowfight', name: 'Shadow Fight', icon: '🥋', color: 'purple' },
  { id: 'cricket', name: 'Hand Cricket', icon: '🏏', color: 'green' },
  { id: 'baseball', name: 'Baseball Pro', icon: '⚾', color: 'red' },
  { id: 'football', name: 'Football Manager', icon: '⚽', color: 'green' },
  { id: 'basketball', name: 'Basketball Stars', icon: '🏀', color: 'orange' },
  { id: 'poker', name: 'Texas Hold\'em Poker', icon: '🃏', color: 'red' },
  { id: 'blackjack', name: 'Blackjack 21', icon: '🎴', color: 'red' },
  { id: 'ludo', name: 'Ludo King', icon: '🎲', color: 'yellow' },
  { id: 'monopoly', name: 'Property Tycoon', icon: '🏠', color: 'green' },
  { id: 'breakout', name: 'Breakout Blitz', icon: '🧱', color: 'orange' },
  { id: 'tetris', name: 'Tetris Classic', icon: '🔲', color: 'cyan' },
  { id: 'minesweeper', name: 'Minesweeper Expert', icon: '💣', color: 'gray' },
  { id: 'towerdefense', name: 'Tower Defense', icon: '🗼', color: 'brown' },
  { id: 'carracing', name: 'Speed Racer', icon: '🏎️', color: 'red' },
  { id: 'bikeracing', name: 'Moto Rush', icon: '🏍️', color: 'blue' },
];

const template = (game) => `'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/sound-manager';
import { vibrationManager } from '@/lib/vibration-manager';
import { useAuthStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import { FaArrowLeft, FaPlay, FaPause, FaRedo, FaTrophy } from 'react-icons/fa';

export default function ${game.name.replace(/[^a-zA-Z]/g, '')}Game() {
  const router = useRouter();
  const { user, addCoins, addExperience } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('${game.id}_high_score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver || paused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Game logic here
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText('${game.name}', canvas.width / 2 - 80, canvas.height / 2);
      ctx.fillText('Press any key to play', canvas.width / 2 - 120, canvas.height / 2 + 40);
      
      animationId = requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted, gameOver, paused]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    soundManager.play('click');
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setPaused(false);
  };

  const handleGameOver = () => {
    setGameOver(true);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('${game.id}_high_score', score.toString());
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    if (user) {
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameId: '${game.id}',
          score,
        }),
      });
      addCoins(Math.floor(score / 10));
      addExperience(score);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-${game.color}-950 via-gray-950 to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-md hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/20"
            whileHover={{ scale: 1.05 }}
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-${game.color}-400 to-${game.color}-600 text-transparent bg-clip-text">
            ${game.icon} ${game.name}
          </h1>

          <div className="w-24" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300 mb-1">Score</p>
            <p className="text-3xl font-bold text-white">{score}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300 mb-1 flex items-center justify-center gap-1">
              <FaTrophy className="text-yellow-400" /> Best
            </p>
            <p className="text-3xl font-bold text-yellow-400">{highScore}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-white/20">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full bg-gradient-to-br from-gray-900 to-black rounded-xl"
          />
        </div>

        <div className="flex justify-center gap-3">
          {!gameStarted ? (
            <motion.button
              onClick={startGame}
              className="bg-gradient-to-r from-${game.color}-500 to-${game.color}-600 hover:from-${game.color}-600 hover:to-${game.color}-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlay />
              <span>Start Game</span>
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={() => setPaused(!paused)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {paused ? <FaPlay /> : <FaPause />}
                <span>{paused ? 'Resume' : 'Pause'}</span>
              </motion.button>
              
              <motion.button
                onClick={resetGame}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaRedo />
                <span>New Game</span>
              </motion.button>
            </>
          )}
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-3">🎮 How to Play</h3>
          <p className="text-gray-300">
            ${game.name} is an exciting game! Use arrow keys or controls to play.
            Score points and try to beat your high score!
          </p>
        </div>

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-white/20"
            >
              <h2 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-${game.color}-400 to-${game.color}-600 text-transparent bg-clip-text">
                Game Over!
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Score</p>
                  <p className="text-2xl font-bold text-white">{score}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Best</p>
                  <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={startGame}
                  className="flex-1 bg-gradient-to-r from-${game.color}-500 to-${game.color}-600 text-white font-bold py-3 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                >
                  Play Again
                </motion.button>
                <motion.button
                  onClick={() => router.back()}
                  className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  Exit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
`;

// Create game directories and files
games.forEach(game => {
  const gameDir = path.join(__dirname, 'app', 'games', game.id);
  const gameFile = path.join(gameDir, 'page.tsx');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(gameDir)) {
    fs.mkdirSync(gameDir, { recursive: true });
  }
  
  // Write game file if it doesn't exist
  if (!fs.existsSync(gameFile)) {
    fs.writeFileSync(gameFile, template(game));
    console.log(`✅ Created ${game.id}/page.tsx`);
  } else {
    console.log(`⏭️  Skipped ${game.id}/page.tsx (already exists)`);
  }
});

console.log('\n🎉 All game files created successfully!');
