'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/sound-manager';
import { vibrationManager } from '@/lib/vibration-manager';
import { useAuthStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import { FaArrowLeft, FaRedo, FaTrophy, FaRobot, FaUsers } from 'react-icons/fa';

export default function TicTacToeGameEnhanced() {
  const router = useRouter();
  const { user, addCoins, addExperience } = useAuthStore();
  
  const [boardSize, setBoardSize] = useState<3 | 5>(3);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });
  const [gameMode, setGameMode] = useState<'ai' | 'multiplayer'>('ai');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'impossible'>('medium');
  const [aiPersonality, setAiPersonality] = useState<'balanced' | 'aggressive' | 'defensive'>('balanced');
  const [tournament, setTournament] = useState({ enabled: false, games: 3, current: 1 });

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }

    if (squares.every(square => square !== null)) {
      return { winner: 'draw', line: null };
    }

    return { winner: null, line: null };
  };

  const minimax = (squares: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares: (string | null)[]): number => {
    if (difficulty === 'easy' && Math.random() > 0.5) {
      // 50% random moves on easy
      const available = squares.map((s, i) => s === null ? i : null).filter(i => i !== null) as number[];
      return available[Math.floor(Math.random() * available.length)];
    }

    if (difficulty === 'medium' && Math.random() > 0.7) {
      // 30% random moves on medium
      const available = squares.map((s, i) => s === null ? i : null).filter(i => i !== null) as number[];
      return available[Math.floor(Math.random() * available.length)];
    }

    let bestScore = -Infinity;
    let bestMove = 0;

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || (gameMode === 'ai' && !isXNext)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    soundManager.play('click');
    vibrationManager.light();

    const result = checkWinner(newBoard);
    if (result.winner) {
      handleGameEnd(result.winner, result.line);
    } else {
      setIsXNext(!isXNext);
      
      // AI move
      if (gameMode === 'ai' && isXNext) {
        setTimeout(() => {
          const aiMove = getBestMove(newBoard);
          const aiBoard = [...newBoard];
          aiBoard[aiMove] = 'O';
          setBoard(aiBoard);
          
          soundManager.play('click');
          vibrationManager.light();
          
          const aiResult = checkWinner(aiBoard);
          if (aiResult.winner) {
            handleGameEnd(aiResult.winner, aiResult.line);
          } else {
            setIsXNext(true);
          }
        }, 500);
      }
    }
  };

  const handleGameEnd = (result: string, line: number[] | null) => {
    setWinner(result);
    setWinLine(line);

    if (result === 'draw') {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      soundManager.play('click');
    } else {
      setScores(prev => ({
        ...prev,
        [result.toLowerCase()]: prev[result.toLowerCase() as 'x' | 'o'] + 1
      }));

      if (result === 'X') {
        soundManager.play('win');
        vibrationManager.success();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const score = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
        if (user) {
          fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              gameId: 'tictactoe',
              score,
            }),
          });
          addCoins(score);
          addExperience(score * 5);
        }
      } else {
        soundManager.play('lose');
        vibrationManager.error();
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinLine(null);
  };

  const resetScores = () => {
    setScores({ x: 0, o: 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="min-h-screen bg-game-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center space-x-2 bg-game-card hover:bg-gray-700 px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>

          <h1 className="text-3xl font-bold">❌ Tic Tac Toe Pro</h1>

          <div className="flex items-center space-x-2">
            <select
              value={gameMode}
              onChange={(e) => {
                setGameMode(e.target.value as any);
                resetScores();
              }}
              className="bg-game-card border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="ai">vs AI</option>
              <option value="multiplayer">2 Player</option>
            </select>
            
            {gameMode === 'ai' && (
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as any);
                  resetScores();
                }}
                className="bg-game-card border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-center">
            <p className="text-4xl mb-2">❌</p>
            <p className="text-3xl font-bold">{scores.x}</p>
            <p className="text-gray-200">Player X</p>
          </div>

          <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-6 text-center">
            <p className="text-4xl mb-2">🤝</p>
            <p className="text-3xl font-bold">{scores.draws}</p>
            <p className="text-gray-200">Draws</p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 text-center">
            <p className="text-4xl mb-2">⭕</p>
            <p className="text-3xl font-bold">{scores.o}</p>
            <p className="text-gray-200">{gameMode === 'ai' ? 'AI' : 'Player O'}</p>
          </div>
        </div>

        <div className="bg-game-card rounded-xl p-8 mb-6">
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {board.map((cell, index) => {
                const isWinningCell = winLine?.includes(index);
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleClick(index)}
                    disabled={!!cell || !!winner}
                    className={`
                      aspect-square text-6xl font-bold rounded-xl transition-all
                      ${!cell && !winner ? 'bg-game-bg hover:bg-gray-700 cursor-pointer' : 'bg-game-bg'}
                      ${isWinningCell ? 'bg-gradient-to-br from-yellow-500 to-orange-500 animate-pulse' : ''}
                      ${cell === 'X' ? 'text-blue-500' : 'text-red-500'}
                    `}
                    whileHover={!cell && !winner ? { scale: 1.05 } : {}}
                    whileTap={!cell && !winner ? { scale: 0.95 } : {}}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
                  </motion.button>
                );
              })}
            </div>

            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <p className="text-3xl font-bold mb-4">
                  {winner === 'draw' 
                    ? "It's a Draw!" 
                    : `${winner === 'X' ? '❌' : '⭕'} ${winner} Wins!`}
                </p>
              </motion.div>
            )}

            {!winner && (
              <div className="mt-6 text-center">
                <p className="text-2xl font-bold">
                  {isXNext ? '❌ X' : '⭕ O'}'s Turn
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={resetGame}
            className="bg-game-accent hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRedo />
            <span>New Game</span>
          </motion.button>

          <motion.button
            onClick={resetScores}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Scores
          </motion.button>
        </div>
      </div>
    </div>
  );
}
