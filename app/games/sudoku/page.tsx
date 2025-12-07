'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/sound-manager';
import { vibrationManager } from '@/lib/vibration-manager';
import { useAuthStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import { FaArrowLeft, FaRedo, FaLightbulb, FaEraser, FaUndo, FaPencilAlt, FaTrophy, FaFire, FaClock, FaPalette } from 'react-icons/fa';

type Board = (number | null)[][];
type Notes = (number[])[][];

interface GameHistory {
  board: Board;
  notes: Notes;
}

export default function SudokuGameEnhanced() {
  const router = useRouter();
  const { user, addCoins, addExperience } = useAuthStore();
  
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [notes, setNotes] = useState<Notes>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [completed, setCompleted] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [theme, setTheme] = useState<'modern' | 'dark' | 'light'>('modern');
  const [streak, setStreak] = useState(0);
  const [bestTime, setBestTime] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('sudoku_data');
    if (saved) {
      const data = JSON.parse(saved);
      setBestTime(data.bestTime || {});
      setStreak(data.streak || 0);
    }
    generatePuzzle();
  }, []);

  useEffect(() => {
    if (!completed) {
      const timer = setInterval(() => setTime(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [completed]);

  const generatePuzzle = useCallback(() => {
    const newSolution = generateSolution();
    setSolution(newSolution);

    const newBoard = JSON.parse(JSON.stringify(newSolution));
    const cellsToRemove = { easy: 35, medium: 45, hard: 52, expert: 58 }[difficulty];
    
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newBoard[row][col] !== null) {
        newBoard[row][col] = null;
        removed++;
      }
    }

    setBoard(newBoard);
    setInitialBoard(JSON.parse(JSON.stringify(newBoard)));
    setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => [])));
    setMistakes(0);
    setTime(0);
    setCompleted(false);
    setHistory([]);
    setSelectedCell(null);
  }, [difficulty]);

  const generateSolution = (): Board => {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    
    const isValid = (board: Board, row: number, col: number, num: number): boolean => {
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
      }
      
      const startRow = row - row % 3;
      const startCol = col - col % 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };

    const solve = (board: Board): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === null) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(board);
    return board;
  };

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] !== null) return;
    setSelectedCell({ row, col });
    soundManager.play('click');
    vibrationManager.light();
  };

  const saveHistory = () => {
    setHistory(prev => [...prev.slice(-19), {
      board: JSON.parse(JSON.stringify(board)),
      notes: JSON.parse(JSON.stringify(notes)),
    }]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    saveHistory();

    if (noteMode) {
      const newNotes = [...notes];
      if (newNotes[row][col].includes(num)) {
        newNotes[row][col] = newNotes[row][col].filter(n => n !== num);
      } else {
        newNotes[row][col] = [...newNotes[row][col], num].sort();
      }
      setNotes(newNotes);
      soundManager.play('click');
    } else {
      const newBoard = [...board];
      newBoard[row][col] = num;
      setBoard(newBoard);

      if (num !== solution[row][col]) {
        setMistakes(prev => prev + 1);
        soundManager.play('error');
        vibrationManager.error();
      } else {
        soundManager.play('coin');
        vibrationManager.light();
        
        const newNotes = [...notes];
        newNotes[row][col] = [];
        setNotes(newNotes);
        
        if (checkComplete(newBoard)) handleWin();
      }
    }
  };

  const checkComplete = (board: Board): boolean => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  };

  const handleWin = () => {
    setCompleted(true);
    soundManager.play('win');
    vibrationManager.success();
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
    });

    const multiplier = { easy: 1, medium: 1.5, hard: 2, expert: 3 }[difficulty];
    const score = Math.floor((1000 * multiplier + Math.max(0, 1000 - time) - mistakes * 50) * (1 + streak * 0.1));
    
    const newStreak = streak + 1;
    setStreak(newStreak);

    if (!bestTime[difficulty] || time < bestTime[difficulty]) {
      const newBestTime = { ...bestTime, [difficulty]: time };
      setBestTime(newBestTime);
      localStorage.setItem('sudoku_data', JSON.stringify({ bestTime: newBestTime, streak: newStreak }));
    }
    
    if (user) {
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, gameId: 'sudoku', score, time }),
      });
      addCoins(Math.floor(score / 10));
      addExperience(score * 2);
    }
  };

  const useHint = () => {
    if (hints === 0 || !selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    saveHistory();
    const newBoard = [...board];
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHints(prev => prev - 1);
    soundManager.play('powerup');
    vibrationManager.medium();
  };

  const clearCell = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    saveHistory();
    const newBoard = [...board];
    newBoard[row][col] = null;
    setBoard(newBoard);
    soundManager.play('click');
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setBoard(previous.board);
    setNotes(previous.notes);
    setHistory(prev => prev.slice(0, -1));
    soundManager.play('click');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const themes = {
    modern: 'from-indigo-950 via-purple-950 to-pink-950',
    dark: 'from-gray-900 via-gray-800 to-gray-900',
    light: 'from-blue-100 via-indigo-100 to-purple-100',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[theme]} p-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.button onClick={() => router.back()} className="flex items-center space-x-2 bg-white/10 backdrop-blur-md hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/20" whileHover={{ scale: 1.05 }}>
            <FaArrowLeft /> <span>Back</span>
          </motion.button>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-600 text-transparent bg-clip-text">
            🔢 Sudoku Master Pro
          </h1>

          <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value as any); setTimeout(generatePuzzle, 100); }} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
            <option value="expert">💀 Expert</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-5 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                <FaClock className="mx-auto mb-1 text-blue-400" />
                <p className="text-xs text-gray-300">Time</p>
                <p className="text-xl font-bold text-white">{formatTime(time)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                <p className="text-xs text-gray-300">Mistakes</p>
                <p className="text-xl font-bold text-red-400">{mistakes}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                <FaLightbulb className="mx-auto mb-1 text-yellow-400" />
                <p className="text-xs text-gray-300">Hints</p>
                <p className="text-xl font-bold text-yellow-400">{hints}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                <FaFire className="mx-auto mb-1 text-orange-400" />
                <p className="text-xs text-gray-300">Streak</p>
                <p className="text-xl font-bold text-orange-400">{streak}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                <FaTrophy className="mx-auto mb-1 text-yellow-400" />
                <p className="text-xs text-gray-300">Best</p>
                <p className="text-sm font-bold text-yellow-400">{bestTime[difficulty] ? formatTime(bestTime[difficulty]) : '--:--'}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/20">
              <div className="grid grid-cols-9 gap-0 max-w-2xl mx-auto">
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                    const isOriginal = initialBoard[rowIndex]?.[colIndex] !== null;
                    const cellNotes = notes[rowIndex]?.[colIndex] || [];

                    return (
                      <motion.button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`aspect-square flex items-center justify-center text-lg md:text-xl font-bold border transition-all relative
                          ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? 'border-b-2 border-b-white/40' : 'border-b border-b-white/20'}
                          ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? 'border-r-2 border-r-white/40' : 'border-r border-r-white/20'}
                          ${isSelected ? 'bg-indigo-600 text-white scale-110 z-10' : ''}
                          ${!isSelected && isOriginal ? 'bg-white/20 text-white font-extrabold' : ''}
                          ${!isSelected && !isOriginal && cell ? 'bg-white/5 text-indigo-400' : ''}
                          ${!isSelected && !cell ? 'bg-white/10 text-gray-500' : ''}
                          ${isOriginal ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
                        `}
                        whileHover={!isOriginal ? { scale: 1.1 } : {}}
                        whileTap={!isOriginal ? { scale: 0.95 } : {}}
                      >
                        {cell || (
                          <div className="grid grid-cols-3 gap-0 text-xs opacity-50 absolute inset-0 p-1">
                            {showCandidates && cellNotes.map(n => (
                              <span key={n} className="text-center text-[8px]">{n}</span>
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid grid-cols-9 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <motion.button key={num} onClick={() => handleNumberInput(num)} className="bg-white/10 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 md:py-4 rounded-xl text-xl md:text-2xl border border-white/20 transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  {num}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <motion.button onClick={() => setNoteMode(!noteMode)} className={`${noteMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'} text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/20`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FaPencilAlt /> <span>Notes</span>
              </motion.button>
              <motion.button onClick={undo} disabled={history.length === 0} className="bg-white/10 hover:opacity-80 disabled:opacity-30 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/20" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FaUndo /> <span>Undo</span>
              </motion.button>
              <motion.button onClick={clearCell} disabled={!selectedCell} className="bg-white/10 hover:opacity-80 disabled:opacity-30 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/20" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FaEraser /> <span>Clear</span>
              </motion.button>
              <motion.button onClick={useHint} disabled={hints === 0 || !selectedCell} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FaLightbulb /> <span>Hint ({hints})</span>
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><FaPalette /> Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['modern', 'dark', 'light'] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`px-3 py-2 rounded-lg text-sm font-bold ${theme === t ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-white/10 text-white'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-bold mb-3">🛠️ Tools</h3>
              <button onClick={() => setShowCandidates(!showCandidates)} className={`w-full ${showCandidates ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-white/20'} hover:opacity-80 text-white font-bold py-2 rounded-lg mb-2`}>
                {showCandidates ? 'Hide' : 'Show'} Candidates
              </button>
            </div>

            <motion.button onClick={generatePuzzle} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FaRedo /> <span>New Game</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {completed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl">
                <div className="text-center">
                  <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">🎉 Congratulations!</h2>
                  <p className="text-xl mb-6 text-gray-300">You solved the puzzle!</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Time</p>
                      <p className="text-2xl font-bold text-white">{formatTime(time)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Mistakes</p>
                      <p className="text-2xl font-bold text-red-400">{mistakes}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button onClick={generatePuzzle} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      New Game
                    </motion.button>
                    <motion.button onClick={() => router.back()} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl border border-white/20" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
