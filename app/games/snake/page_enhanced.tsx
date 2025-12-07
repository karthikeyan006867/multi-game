'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/sound-manager';
import { vibrationManager } from '@/lib/vibration-manager';
import { useAuthStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import { FaArrowLeft, FaPause, FaPlay, FaRedo, FaTrophy, FaStar, FaCrown, FaFire, FaPalette, FaGamepad } from 'react-icons/fa';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'speed' | 'slow' | 'invincible' | 'double' | 'magnet';
  duration: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const THEMES = {
  classic: {
    bg: '#0a0e27',
    grid: '#1a1f3a',
    snake: '#22c55e',
    food: '#ef4444',
    powerup: '#f59e0b',
    obstacle: '#dc2626',
  },
  neon: {
    bg: '#000000',
    grid: '#0a0a1f',
    snake: '#00ff88',
    food: '#ff0088',
    powerup: '#ffaa00',
    obstacle: '#8800ff',
  },
  retro: {
    bg: '#1a1a1a',
    grid: '#2a2a2a',
    snake: '#00ff00',
    food: '#ffff00',
    powerup: '#00ffff',
    obstacle: '#ff0000',
  },
};

export default function SnakeGameEnhanced() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { user, addCoins, addExperience } = useAuthStore();
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [theme, setTheme] = useState<'classic' | 'neon' | 'retro'>('classic');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'extreme'>('normal');
  const [showStats, setShowStats] = useState(false);
  const [foodEaten, setFoodEaten] = useState(0);
  const [activeModifiers, setActiveModifiers] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_food', name: 'First Bite', description: 'Eat your first food', unlocked: false, icon: '🍎' },
    { id: 'combo_5', name: 'Combo Master', description: 'Reach 5x combo', unlocked: false, icon: '🔥' },
    { id: 'score_100', name: 'Century', description: 'Score 100 points', unlocked: false, icon: '💯' },
    { id: 'score_500', name: 'Champion', description: 'Score 500 points', unlocked: false, icon: '🏆' },
    { id: 'level_10', name: 'Level Master', description: 'Reach level 10', unlocked: false, icon: '⭐' },
    { id: 'snake_50', name: 'Long Snake', description: 'Grow snake to 50 segments', unlocked: false, icon: '🐍' },
  ]);
  
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    powerUps: [] as PowerUp[],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    obstacles: [] as { x: number; y: number }[],
    particles: [] as Particle[],
    gridSize: 25,
    tileSize: 20,
    invincible: false,
    doublePoints: false,
    magnetActive: false,
  });

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('snake_enhanced_data');
    if (saved) {
      const data = JSON.parse(saved);
      setHighScore(data.highScore || 0);
      setMaxCombo(data.maxCombo || 0);
      setAchievements(data.achievements || achievements);
    }
  }, []);

  // Save progress
  const saveProgress = useCallback(() => {
    localStorage.setItem('snake_enhanced_data', JSON.stringify({
      highScore,
      maxCombo,
      achievements,
    }));
  }, [highScore, maxCombo, achievements]);

  // Unlock achievement
  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const updated = prev.map(a => 
        a.id === id && !a.unlocked ? { ...a, unlocked: true } : a
      );
      const achievement = updated.find(a => a.id === id);
      if (achievement && !prev.find(a => a.id === id)?.unlocked) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
        soundManager.play('powerup');
      }
      return updated;
    });
  }, []);

  // Create particles
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 3 + 2,
      });
    }
    gameStateRef.current.particles.push(...newParticles);
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const gameState = gameStateRef.current;
    let animationFrame: number;
    let lastTime = 0;
    let comboTimer = 0;

    const generateFood = () => {
      let newFood: { x: number; y: number };
      do {
        newFood = {
          x: Math.floor(Math.random() * gameState.gridSize),
          y: Math.floor(Math.random() * gameState.gridSize),
        };
      } while (
        gameState.snake.some(s => s.x === newFood.x && s.y === newFood.y) ||
        gameState.obstacles.some(o => o.x === newFood.x && o.y === newFood.y)
      );
      gameState.food = newFood;
    };

    const generatePowerUp = () => {
      if (Math.random() > 0.6 && gameState.powerUps.length < 2) {
        let newPowerUp: PowerUp;
        do {
          const types: PowerUp['type'][] = ['speed', 'slow', 'invincible', 'double', 'magnet'];
          newPowerUp = {
            x: Math.floor(Math.random() * gameState.gridSize),
            y: Math.floor(Math.random() * gameState.gridSize),
            type: types[Math.floor(Math.random() * types.length)],
            duration: 5000,
          };
        } while (
          gameState.snake.some(s => s.x === newPowerUp.x && s.y === newPowerUp.y) ||
          gameState.obstacles.some(o => o.x === newPowerUp.x && o.y === newPowerUp.y) ||
          (gameState.food.x === newPowerUp.x && gameState.food.y === newPowerUp.y)
        );
        gameState.powerUps.push(newPowerUp);
      }
    };

    const generateObstacles = (count: number) => {
      for (let i = 0; i < count; i++) {
        let newObstacle: { x: number; y: number };
        let attempts = 0;
        do {
          newObstacle = {
            x: Math.floor(Math.random() * gameState.gridSize),
            y: Math.floor(Math.random() * gameState.gridSize),
          };
          attempts++;
          if (attempts > 50) break;
        } while (
          gameState.snake.some(s => s.x === newObstacle.x && s.y === newObstacle.y) ||
          (gameState.food.x === newObstacle.x && gameState.food.y === newObstacle.y) ||
          gameState.obstacles.some(o => o.x === newObstacle.x && o.y === newObstacle.y) ||
          (Math.abs(newObstacle.x - 10) < 3 && Math.abs(newObstacle.y - 10) < 3)
        );
        if (attempts <= 50) gameState.obstacles.push(newObstacle);
      }
    };

    const update = () => {
      if (gameOver || paused) return;

      // Apply queued direction
      gameState.direction = gameState.nextDirection;

      const head = { ...gameState.snake[0] };
      head.x += gameState.direction.x;
      head.y += gameState.direction.y;

      // Wrap around or hit walls based on difficulty
      if (difficulty === 'easy' || difficulty === 'normal') {
        if (head.x < 0) head.x = gameState.gridSize - 1;
        if (head.x >= gameState.gridSize) head.x = 0;
        if (head.y < 0) head.y = gameState.gridSize - 1;
        if (head.y >= gameState.gridSize) head.y = 0;
      } else {
        if (head.x < 0 || head.x >= gameState.gridSize || head.y < 0 || head.y >= gameState.gridSize) {
          handleGameOver();
          return;
        }
      }

      // Check collision with self
      if (!gameState.invincible && gameState.snake.some(s => s.x === head.x && s.y === head.y)) {
        handleGameOver();
        return;
      }

      // Check collision with obstacles
      if (!gameState.invincible && gameState.obstacles.some(o => o.x === head.x && o.y === head.y)) {
        handleGameOver();
        return;
      }

      gameState.snake.unshift(head);

      // Check food collision
      let ateFood = false;
      if (head.x === gameState.food.x && head.y === gameState.food.y) {
        ateFood = true;
        const comboMultiplier = Math.min(combo + 1, 10);
        const basePoints = 10;
        const points = basePoints * comboMultiplier * (gameState.doublePoints ? 2 : 1);
        
        setScore(prev => prev + points);
        setCombo(prev => prev + 1);
        setFoodEaten(prev => prev + 1);
        
        soundManager.play('coin');
        vibrationManager.light();
        createParticles(head.x * gameState.tileSize, head.y * gameState.tileSize, THEMES[theme].food, 15);
        
        generateFood();
        generatePowerUp();
        comboTimer = 0;
        
        // Check achievements
        if (foodEaten + 1 === 1) unlockAchievement('first_food');
        if (combo + 1 === 5) unlockAchievement('combo_5');
        if (gameState.snake.length === 50) unlockAchievement('snake_50');
      } else {
        gameState.snake.pop();
      }

      // Magnetic food attraction
      if (gameState.magnetActive) {
        const dx = head.x - gameState.food.x;
        const dy = head.y - gameState.food.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 5 && dist > 0) {
          if (Math.abs(dx) > Math.abs(dy)) {
            gameState.food.x += dx > 0 ? 1 : -1;
          } else {
            gameState.food.y += dy > 0 ? 1 : -1;
          }
        }
      }

      // Check power-up collision
      gameState.powerUps = gameState.powerUps.filter(powerUp => {
        if (head.x === powerUp.x && head.y === powerUp.y) {
          handlePowerUp(powerUp.type);
          createParticles(head.x * gameState.tileSize, head.y * gameState.tileSize, THEMES[theme].powerup, 20);
          return false;
        }
        return true;
      });

      // Update combo timer
      if (ateFood) {
        comboTimer = 0;
      } else {
        comboTimer++;
        if (comboTimer > 100) {
          setCombo(0);
        }
      }

      // Level up
      const newLevel = Math.floor(score / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        const obstacleCount = difficulty === 'easy' ? 1 : difficulty === 'normal' ? 2 : 3;
        generateObstacles(obstacleCount);
        setSpeed(prev => Math.max(30, prev - 3));
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        soundManager.play('powerup');
        
        if (newLevel === 10) unlockAchievement('level_10');
      }

      // Check score achievements
      if (score >= 100 && score < 200) unlockAchievement('score_100');
      if (score >= 500) unlockAchievement('score_500');

      // Update particles
      gameState.particles = gameState.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.02;
        return p.life > 0;
      });
    };

    const handlePowerUp = (type: PowerUp['type']) => {
      soundManager.play('powerup');
      vibrationManager.medium();

      setActiveModifiers(prev => [...prev, type]);

      switch (type) {
        case 'speed':
          setSpeed(prev => prev * 0.6);
          setTimeout(() => {
            setSpeed(prev => prev / 0.6);
            setActiveModifiers(prev => prev.filter(m => m !== type));
          }, 5000);
          break;
        case 'slow':
          setSpeed(prev => prev * 1.5);
          setTimeout(() => {
            setSpeed(prev => prev / 1.5);
            setActiveModifiers(prev => prev.filter(m => m !== type));
          }, 5000);
          break;
        case 'invincible':
          gameState.invincible = true;
          setTimeout(() => {
            gameState.invincible = false;
            setActiveModifiers(prev => prev.filter(m => m !== type));
          }, 5000);
          break;
        case 'double':
          gameState.doublePoints = true;
          setTimeout(() => {
            gameState.doublePoints = false;
            setActiveModifiers(prev => prev.filter(m => m !== type));
          }, 8000);
          break;
        case 'magnet':
          gameState.magnetActive = true;
          setTimeout(() => {
            gameState.magnetActive = false;
            setActiveModifiers(prev => prev.filter(m => m !== type));
          }, 6000);
          break;
      }
    };

    const draw = () => {
      const colors = THEMES[theme];
      
      // Background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gameState.gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gameState.tileSize, 0);
        ctx.lineTo(i * gameState.tileSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gameState.tileSize);
        ctx.lineTo(canvas.width, i * gameState.tileSize);
        ctx.stroke();
      }

      // Obstacles with glow
      gameState.obstacles.forEach(obs => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.obstacle;
        ctx.fillStyle = colors.obstacle;
        ctx.fillRect(
          obs.x * gameState.tileSize + 2,
          obs.y * gameState.tileSize + 2,
          gameState.tileSize - 4,
          gameState.tileSize - 4
        );
        ctx.shadowBlur = 0;
      });

      // Food with pulsing glow
      const time = Date.now() / 200;
      const pulse = Math.sin(time) * 0.5 + 0.5;
      ctx.shadowBlur = 15 + pulse * 10;
      ctx.shadowColor = colors.food;
      ctx.fillStyle = colors.food;
      ctx.beginPath();
      ctx.arc(
        gameState.food.x * gameState.tileSize + gameState.tileSize / 2,
        gameState.food.y * gameState.tileSize + gameState.tileSize / 2,
        gameState.tileSize / 3 + pulse * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Power-ups with rotation
      gameState.powerUps.forEach(powerUp => {
        const rotation = (Date.now() / 500) % (Math.PI * 2);
        ctx.save();
        ctx.translate(
          powerUp.x * gameState.tileSize + gameState.tileSize / 2,
          powerUp.y * gameState.tileSize + gameState.tileSize / 2
        );
        ctx.rotate(rotation);
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.powerup;
        ctx.fillStyle = colors.powerup;
        ctx.fillRect(-gameState.tileSize / 3, -gameState.tileSize / 3, gameState.tileSize * 2 / 3, gameState.tileSize * 2 / 3);
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // Snake with gradient and glow
      gameState.snake.forEach((segment, index) => {
        const alpha = 1 - (index / gameState.snake.length) * 0.4;
        const isHead = index === 0;
        
        if (gameState.invincible) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffff00';
        }
        
        ctx.fillStyle = isHead ? colors.snake : `${colors.snake}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fillRect(
          segment.x * gameState.tileSize + 1,
          segment.y * gameState.tileSize + 1,
          gameState.tileSize - 2,
          gameState.tileSize - 2
        );
        
        // Eyes on head
        if (isHead) {
          ctx.fillStyle = '#ffffff';
          const eyeSize = 3;
          const eyeOffset = 4;
          
          if (gameState.direction.x === 1) {
            ctx.fillRect(segment.x * gameState.tileSize + gameState.tileSize - eyeOffset - eyeSize, segment.y * gameState.tileSize + 4, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gameState.tileSize + gameState.tileSize - eyeOffset - eyeSize, segment.y * gameState.tileSize + gameState.tileSize - 7, eyeSize, eyeSize);
          } else if (gameState.direction.x === -1) {
            ctx.fillRect(segment.x * gameState.tileSize + eyeOffset, segment.y * gameState.tileSize + 4, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gameState.tileSize + eyeOffset, segment.y * gameState.tileSize + gameState.tileSize - 7, eyeSize, eyeSize);
          } else if (gameState.direction.y === -1) {
            ctx.fillRect(segment.x * gameState.tileSize + 4, segment.y * gameState.tileSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gameState.tileSize + gameState.tileSize - 7, segment.y * gameState.tileSize + eyeOffset, eyeSize, eyeSize);
          } else {
            ctx.fillRect(segment.x * gameState.tileSize + 4, segment.y * gameState.tileSize + gameState.tileSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            ctx.fillRect(segment.x * gameState.tileSize + gameState.tileSize - 7, segment.y * gameState.tileSize + gameState.tileSize - eyeOffset - eyeSize, eyeSize, eyeSize);
          }
        }
        
        ctx.shadowBlur = 0;
      });

      // Particles
      gameState.particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= speed) {
        update();
        draw();
        lastTime = currentTime;
      } else {
        draw(); // Still draw particles
      }

      animationFrame = requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      const { direction, nextDirection } = gameState;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) {
            gameState.nextDirection = { x: 0, y: -1 };
            soundManager.play('click');
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) {
            gameState.nextDirection = { x: 0, y: 1 };
            soundManager.play('click');
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) {
            gameState.nextDirection = { x: -1, y: 0 };
            soundManager.play('click');
          }
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) {
            gameState.nextDirection = { x: 1, y: 0 };
            soundManager.play('click');
          }
          e.preventDefault();
          break;
        case ' ':
          setPaused(prev => !prev);
          e.preventDefault();
          break;
      }
    };

    const handleGameOver = () => {
      setGameOver(true);
      soundManager.play('lose');
      vibrationManager.error();

      if (score > highScore) {
        setHighScore(score);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
      }

      if (combo > maxCombo) {
        setMaxCombo(combo);
      }

      // Save score
      if (user) {
        fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            gameId: 'snake',
            score,
            level,
          }),
        });

        addCoins(Math.floor(score / 5));
        addExperience(score * 2);
      }

      saveProgress();
    };

    window.addEventListener('keydown', handleKeyPress);
    animationFrame = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      cancelAnimationFrame(animationFrame);
    };
  }, [score, highScore, gameOver, paused, speed, level, theme, difficulty, combo, foodEaten, user, unlockAchievement, createParticles, saveProgress, addCoins, addExperience]);

  const resetGame = () => {
    gameStateRef.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      powerUps: [],
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      obstacles: [],
      particles: [],
      gridSize: 25,
      tileSize: 20,
      invincible: false,
      doublePoints: false,
      magnetActive: false,
    };
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setCombo(0);
    setLevel(1);
    setFoodEaten(0);
    setActiveModifiers([]);
    setSpeed(difficulty === 'easy' ? 120 : difficulty === 'normal' ? 100 : difficulty === 'hard' ? 80 : 60);
  };

  const powerUpIcons = {
    speed: '⚡',
    slow: '🐌',
    invincible: '🛡️',
    double: '💎',
    magnet: '🧲',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-md hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/20"
            whileHover={{ scale: 1.05 }}
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
            🐍 Snake Evolution Pro
          </h1>

          <motion.button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-md hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/20"
            whileHover={{ scale: 1.05 }}
          >
            <FaTrophy />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <p className="text-xs text-gray-300">Score</p>
                <p className="text-2xl font-bold text-white">{score}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <p className="text-xs text-gray-300">Level</p>
                <p className="text-2xl font-bold text-white">{level}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <p className="text-xs text-gray-300">Combo</p>
                <p className="text-2xl font-bold text-orange-400">{combo}x</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <p className="text-xs text-gray-300">Best</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            </div>

            {/* Active Modifiers */}
            {activeModifiers.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {activeModifiers.map((mod, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                  >
                    <span>{powerUpIcons[mod as keyof typeof powerUpIcons]}</span>
                    <span className="capitalize">{mod}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Canvas */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={500}
                  className="border-4 border-white/20 rounded-2xl shadow-2xl bg-black/30 backdrop-blur-sm"
                />
                {paused && !gameOver && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <FaPause className="text-6xl text-white mx-auto mb-4" />
                      <p className="text-2xl font-bold text-white">PAUSED</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 flex-wrap">
              <motion.button
                onClick={() => setPaused(!paused)}
                disabled={gameOver}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {paused ? <FaPlay /> : <FaPause />}
                <span>{paused ? 'Resume' : 'Pause'}</span>
              </motion.button>

              <motion.button
                onClick={resetGame}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaRedo />
                <span>New Game</span>
              </motion.button>

              <motion.button
                onClick={() => setTheme(t => t === 'classic' ? 'neon' : t === 'neon' ? 'retro' : 'classic')}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPalette />
                <span className="capitalize">{theme}</span>
              </motion.button>
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
              <div></div>
              <motion.button
                onClick={() => {
                  if (gameStateRef.current.direction.y === 0) {
                    gameStateRef.current.nextDirection = { x: 0, y: -1 };
                    soundManager.play('click');
                  }
                }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <FaGamepad className="mx-auto text-2xl" />
              </motion.button>
              <div></div>
              <motion.button
                onClick={() => {
                  if (gameStateRef.current.direction.x === 0) {
                    gameStateRef.current.nextDirection = { x: -1, y: 0 };
                    soundManager.play('click');
                  }
                }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <FaGamepad className="mx-auto text-2xl rotate-90" />
              </motion.button>
              <motion.button
                onClick={() => setPaused(!paused)}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
                whileTap={{ scale: 0.95 }}
              >
                {paused ? <FaPlay className="mx-auto text-2xl" /> : <FaPause className="mx-auto text-2xl" />}
              </motion.button>
              <motion.button
                onClick={() => {
                  if (gameStateRef.current.direction.x === 0) {
                    gameStateRef.current.nextDirection = { x: 1, y: 0 };
                    soundManager.play('click');
                  }
                }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <FaGamepad className="mx-auto text-2xl -rotate-90" />
              </motion.button>
              <div></div>
              <motion.button
                onClick={() => {
                  if (gameStateRef.current.direction.y === 0) {
                    gameStateRef.current.nextDirection = { x: 0, y: 1 };
                    soundManager.play('click');
                  }
                }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <FaGamepad className="mx-auto text-2xl rotate-180" />
              </motion.button>
              <div></div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Difficulty */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                Difficulty
              </h3>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as any);
                  resetGame();
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              >
                <option value="easy">🟢 Easy</option>
                <option value="normal">🟡 Normal</option>
                <option value="hard">🔴 Hard</option>
                <option value="extreme">💀 Extreme</option>
              </select>
            </div>

            {/* Power-ups Guide */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-bold mb-3">Power-ups</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span>Speed Boost</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐌</span>
                  <span>Slow Motion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <span>Invincibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <span>Double Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧲</span>
                  <span>Food Magnet</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                Achievements
              </h3>
              <div className="space-y-2">
                {achievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' : 'bg-white/5'}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{achievement.name}</p>
                        <p className="text-xs text-gray-400">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && <FaCrown className="text-yellow-400" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Controls Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-bold mb-3">Controls</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Arrow Keys / WASD</span>
                  <span>Move</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Spacebar</span>
                  <span>Pause</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && resetGame()}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <h2 className="text-5xl font-bold mb-2 bg-gradient-to-r from-red-400 to-pink-600 text-transparent bg-clip-text">Game Over!</h2>
                  </motion.div>
                  
                  <p className="text-6xl mb-6">💀</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Final Score</p>
                      <p className="text-3xl font-bold text-white">{score}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">High Score</p>
                      <p className="text-3xl font-bold text-yellow-400">{highScore}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Level Reached</p>
                      <p className="text-3xl font-bold text-blue-400">{level}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Max Combo</p>
                      <p className="text-3xl font-bold text-orange-400">{combo}x</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={resetGame}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Play Again
                    </motion.button>
                    <motion.button
                      onClick={() => router.back()}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl border border-white/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Exit
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
