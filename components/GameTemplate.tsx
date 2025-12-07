/**
 * Game Template Generator
 * Use this template to quickly create new games
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/sound-manager';
import { vibrationManager } from '@/lib/vibration-manager';
import { useAuthStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import { FaArrowLeft, FaPause, FaPlay, FaRedo } from 'react-icons/fa';

interface GameState {
  score: number;
  level: number;
  lives: number;
  gameOver: boolean;
  paused: boolean;
  highScore: number;
}

export default function GameTemplate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { user, addCoins, addExperience } = useAuthStore();
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false,
    highScore: 0,
  });

  // Initialize game
  useEffect(() => {
    const savedHighScore = localStorage.getItem('game_high_score');
    if (savedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
    }
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let lastTime = 0;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (!gameState.paused && !gameState.gameOver) {
        update(deltaTime);
        render(ctx);
      }

      lastTime = currentTime;
      animationFrame = requestAnimationFrame(gameLoop);
    };

    const update = (deltaTime: number) => {
      // Game logic here
    };

    const render = (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render game objects here
    };

    animationFrame = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [gameState]);

  // Handle input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (e.key) {
        case ' ':
          togglePause();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Handle movement
          soundManager.play('click');
          vibrationManager.light();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
    soundManager.play('click');
  };

  const increaseScore = (points: number) => {
    const newScore = gameState.score + points;
    setGameState(prev => ({ ...prev, score: newScore }));
    soundManager.play('coin');
    vibrationManager.light();

    // Check for level up
    if (Math.floor(newScore / 1000) > gameState.level) {
      levelUp();
    }
  };

  const levelUp = () => {
    setGameState(prev => ({ ...prev, level: prev.level + 1 }));
    soundManager.play('levelup');
    vibrationManager.medium();
  };

  const loseLife = () => {
    const newLives = gameState.lives - 1;
    setGameState(prev => ({ ...prev, lives: newLives }));
    soundManager.play('hit');
    vibrationManager.error();

    if (newLives <= 0) {
      handleGameOver();
    }
  };

  const handleGameOver = () => {
    setGameState(prev => ({ ...prev, gameOver: true }));
    soundManager.play('lose');
    vibrationManager.error();

    if (gameState.score > gameState.highScore) {
      const newHighScore = gameState.score;
      setGameState(prev => ({ ...prev, highScore: newHighScore }));
      localStorage.setItem('game_high_score', newHighScore.toString());
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    // Save score to database
    if (user) {
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameId: 'template', // Change this
          score: gameState.score,
          level: gameState.level,
        }),
      });

      addCoins(Math.floor(gameState.score / 10));
      addExperience(gameState.score);
    }
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      gameOver: false,
      paused: false,
      highScore: gameState.highScore,
    });
  };

  return (
    <div className="min-h-screen bg-game-bg p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center space-x-2 bg-game-card hover:bg-gray-700 px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>

          <h1 className="text-3xl font-bold">🎮 Game Title</h1>

          <div className="flex items-center space-x-4">
            <div className="bg-game-card px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Score</p>
              <p className="text-2xl font-bold">{gameState.score}</p>
            </div>
            <div className="bg-game-card px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Level</p>
              <p className="text-2xl font-bold">{gameState.level}</p>
            </div>
            <div className="bg-game-card px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Lives</p>
              <p className="text-2xl font-bold">{'❤️'.repeat(gameState.lives)}</p>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-4 border-game-accent rounded-lg shadow-2xl"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <motion.button
            onClick={togglePause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {gameState.paused ? <FaPlay /> : <FaPause />}
            <span>{gameState.paused ? 'Resume' : 'Pause'}</span>
          </motion.button>

          <motion.button
            onClick={resetGame}
            className="bg-game-accent hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRedo />
            <span>New Game</span>
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="bg-game-card rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">How to Play</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Arrow Keys</p>
              <p>Move your character</p>
            </div>
            <div>
              <p className="text-gray-400">Spacebar</p>
              <p>Pause/Resume</p>
            </div>
            <div>
              <p className="text-gray-400">Goal</p>
              <p>Get the highest score!</p>
            </div>
            <div>
              <p className="text-gray-400">High Score</p>
              <p className="text-yellow-500">{gameState.highScore}</p>
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-game-card rounded-xl p-8 max-w-md text-center"
              >
                <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
                <p className="text-6xl mb-4">😢</p>
                <p className="text-2xl mb-2">Final Score: {gameState.score}</p>
                <p className="text-xl mb-2">Level Reached: {gameState.level}</p>
                <p className="text-gray-400 mb-6">High Score: {gameState.highScore}</p>
                <div className="flex space-x-4">
                  <motion.button
                    onClick={resetGame}
                    className="flex-1 bg-game-accent hover:bg-indigo-700 text-white font-bold py-3 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    Play Again
                  </motion.button>
                  <motion.button
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    Exit
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
