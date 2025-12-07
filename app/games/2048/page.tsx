'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/sound-manager';
import { vibrationManager } from '@/lib/vibration-manager';
import { useAuthStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import { FaArrowLeft, FaRedo, FaUndo, FaTrophy, FaFire } from 'react-icons/fa';

interface Tile {
  id: number;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  isMerged?: boolean;
}

export default function Game2048() {
  const router = useRouter();
  const { user, addCoins, addExperience } = useAuthStore();
  
  const [gridSize, setGridSize] = useState<4 | 5 | 6>(4);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState<{ tiles: Tile[]; score: number }[]>([]);
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('2048_best_score');
    if (saved) setBestScore(parseInt(saved));
    initGame();
  }, [gridSize]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver && !won) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tiles, gameOver, won]);

  const initGame = () => {
    const newTiles: Tile[] = [];
    addRandomTile(newTiles);
    addRandomTile(newTiles);
    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setHistory([]);
    setMoveCount(0);
  };

  const addRandomTile = (currentTiles: Tile[]) => {
    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!currentTiles.some(t => t.position.row === row && t.position.col === col)) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return false;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newTile: Tile = {
      id: Date.now() + Math.random(),
      value: Math.random() < 0.9 ? 2 : 4,
      position: randomCell,
      isNew: true,
    };
    currentTiles.push(newTile);
    return true;
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    setHistory(prev => [...prev.slice(-9), { tiles: JSON.parse(JSON.stringify(tiles)), score }]);
    
    let moved = false;
    let newScore = score;
    const newTiles = tiles.map(t => ({ ...t, isNew: false, isMerged: false }));

    const getLine = (index: number): Tile[] => {
      if (direction === 'left' || direction === 'right') {
        return newTiles.filter(t => t.position.row === index);
      } else {
        return newTiles.filter(t => t.position.col === index);
      }
    };

    const setLine = (index: number, line: Tile[]) => {
      line.forEach((tile, i) => {
        const tileIndex = newTiles.findIndex(t => t.id === tile.id);
        if (tileIndex !== -1) {
          if (direction === 'left' || direction === 'right') {
            newTiles[tileIndex].position.col = direction === 'left' ? i : gridSize - 1 - i;
          } else {
            newTiles[tileIndex].position.row = direction === 'up' ? i : gridSize - 1 - i;
          }
        }
      });
    };

    const mergeLine = (line: Tile[]): Tile[] => {
      const sorted = direction === 'right' || direction === 'down' 
        ? line.sort((a, b) => {
            if (direction === 'right') return b.position.col - a.position.col;
            return b.position.row - a.position.row;
          })
        : line.sort((a, b) => {
            if (direction === 'left') return a.position.col - b.position.col;
            return a.position.row - b.position.row;
          });

      const result: Tile[] = [];
      let i = 0;
      while (i < sorted.length) {
        if (i + 1 < sorted.length && sorted[i].value === sorted[i + 1].value) {
          const mergedTile: Tile = {
            ...sorted[i],
            value: sorted[i].value * 2,
            isMerged: true,
          };
          result.push(mergedTile);
          newScore += mergedTile.value;
          
          const indexToRemove = newTiles.findIndex(t => t.id === sorted[i + 1].id);
          if (indexToRemove !== -1) newTiles.splice(indexToRemove, 1);
          
          if (mergedTile.value === 2048 && !won) {
            setWon(true);
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.6 },
            });
          }
          i += 2;
          moved = true;
        } else {
          result.push(sorted[i]);
          i++;
        }
      }

      return result;
    };

    for (let i = 0; i < gridSize; i++) {
      const line = getLine(i);
      const originalPositions = line.map(t => ({ ...t.position }));
      const merged = mergeLine(line);
      setLine(i, merged);
      
      const movedInLine = merged.some((t, idx) => {
        const original = originalPositions[idx];
        return original && (original.row !== t.position.row || original.col !== t.position.col);
      }) || line.length !== merged.length;
      
      if (movedInLine) moved = true;
    }

    if (moved) {
      soundManager.play('click');
      vibrationManager.light();
      setScore(newScore);
      setMoveCount(prev => prev + 1);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048_best_score', newScore.toString());
      }

      setTimeout(() => {
        const tilesAfterMove = [...newTiles];
        const added = addRandomTile(tilesAfterMove);
        setTiles(tilesAfterMove);
        
        if (!added || !canMove(tilesAfterMove)) {
          setGameOver(true);
          soundManager.play('lose');
          
          if (user) {
            fetch('/api/scores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                gameId: '2048',
                score: newScore,
              }),
            });
            addCoins(Math.floor(newScore / 100));
            addExperience(newScore / 10);
          }
        }
      }, 150);
    }
  };

  const canMove = (currentTiles: Tile[]): boolean => {
    if (currentTiles.length < gridSize * gridSize) return true;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const tile = currentTiles.find(t => t.position.row === row && t.position.col === col);
        if (!tile) return true;

        const neighbors = [
          currentTiles.find(t => t.position.row === row && t.position.col === col + 1),
          currentTiles.find(t => t.position.row === row && t.position.col === col - 1),
          currentTiles.find(t => t.position.row === row + 1 && t.position.col === col),
          currentTiles.find(t => t.position.row === row - 1 && t.position.col === col),
        ];

        if (neighbors.some(n => n && n.value === tile.value)) return true;
      }
    }

    return false;
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setTiles(previous.tiles);
    setScore(previous.score);
    setHistory(prev => prev.slice(0, -1));
    setGameOver(false);
    soundManager.play('click');
  };

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      2: 'bg-gradient-to-br from-yellow-200 to-yellow-300 text-gray-800',
      4: 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800',
      8: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
      16: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
      32: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
      64: 'bg-gradient-to-br from-red-600 to-red-700 text-white',
      128: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
      256: 'bg-gradient-to-br from-yellow-600 to-yellow-700 text-white',
      512: 'bg-gradient-to-br from-yellow-700 to-yellow-800 text-white',
      1024: 'bg-gradient-to-br from-yellow-800 to-yellow-900 text-white',
      2048: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white',
    };
    return colors[value] || 'bg-gradient-to-br from-pink-600 to-purple-700 text-white';
  };

  const tileSize = gridSize === 4 ? 'w-24 h-24 text-3xl' : gridSize === 5 ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 p-4 md:p-8">
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

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 text-transparent bg-clip-text">
            🎯 2048 Pro
          </h1>

          <select
            value={gridSize}
            onChange={(e) => {
              setGridSize(parseInt(e.target.value) as any);
            }}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="4">4x4</option>
            <option value="5">5x5</option>
            <option value="6">6x6</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300 mb-1">Score</p>
            <p className="text-3xl font-bold text-white">{score}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300 mb-1 flex items-center justify-center gap-1">
              <FaTrophy className="text-yellow-400" /> Best
            </p>
            <p className="text-3xl font-bold text-yellow-400">{bestScore}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300 mb-1 flex items-center justify-center gap-1">
              <FaFire className="text-orange-400" /> Moves
            </p>
            <p className="text-3xl font-bold text-orange-400">{moveCount}</p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6 border-2 border-white/30 shadow-2xl mx-auto" style={{ maxWidth: gridSize === 4 ? '450px' : gridSize === 5 ? '480px' : '510px' }}>
          <div 
            className="relative bg-white/10 rounded-xl p-2 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, i) => (
              <div
                key={i}
                className={`${tileSize} bg-white/5 rounded-lg`}
              />
            ))}

            <AnimatePresence>
              {tiles.map(tile => (
                <motion.div
                  key={tile.id}
                  initial={tile.isNew ? { scale: 0 } : false}
                  animate={{
                    scale: tile.isMerged ? [1, 1.2, 1] : 1,
                    x: tile.position.col * (gridSize === 4 ? 104 : gridSize === 5 ? 88 : 72),
                    y: tile.position.row * (gridSize === 4 ? 104 : gridSize === 5 ? 88 : 72),
                  }}
                  transition={{ duration: 0.15 }}
                  className={`${tileSize} ${getTileColor(tile.value)} rounded-lg font-bold flex items-center justify-center absolute shadow-lg`}
                  style={{
                    left: '8px',
                    top: '8px',
                  }}
                >
                  {tile.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-center gap-3 flex-wrap mb-6">
          <motion.button
            onClick={initGame}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRedo />
            <span>New Game</span>
          </motion.button>

          <motion.button
            onClick={undo}
            disabled={history.length === 0}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUndo />
            <span>Undo</span>
          </motion.button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-3">🎮 How to Play</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Arrow Keys:</strong> Move tiles</p>
            <p><strong className="text-white">Goal:</strong> Combine tiles to reach 2048!</p>
            <p><strong className="text-white">Tip:</strong> Keep your highest tile in a corner</p>
          </div>
        </div>

        <AnimatePresence>
          {(gameOver || won) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl"
              >
                <div className="text-center">
                  <h2 className={`text-5xl font-bold mb-4 ${won ? 'bg-gradient-to-r from-yellow-400 to-orange-600' : 'bg-gradient-to-r from-red-400 to-pink-600'} text-transparent bg-clip-text`}>
                    {won ? '🎉 You Win!' : '💀 Game Over'}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Final Score</p>
                      <p className="text-3xl font-bold text-white">{score}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Best Score</p>
                      <p className="text-3xl font-bold text-yellow-400">{bestScore}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={initGame}
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
