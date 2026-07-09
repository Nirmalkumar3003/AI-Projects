/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Moon,
  Sun,
  Trophy,
  RefreshCw,
  Volume2,
  VolumeX,
  User,
  Users,
  Cpu,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  Info,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { checkWinner, isBoardFull, getAIMove } from './utils/ai';
import { soundManager } from './utils/sound';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tictactoe_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to dark mode for beautiful neon-glassmorphic aesthetic
    return 'dark';
  });

  // Sound state
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('tictactoe_muted') === 'true';
  });

  // Game setup states
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>(() => {
    const saved = localStorage.getItem('tictactoe_gamemode');
    return saved === 'ai' ? 'ai' : 'pvp';
  });
  
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'impossible'>(() => {
    const saved = localStorage.getItem('tictactoe_difficulty');
    return saved === 'easy' || saved === 'medium' || saved === 'impossible' ? saved : 'impossible';
  });

  const [playerMarker, setPlayerMarker] = useState<'X' | 'O'>(() => {
    const saved = localStorage.getItem('tictactoe_marker');
    return saved === 'O' ? 'O' : 'X';
  });

  // Core board state
  const [board, setBoard] = useState<(string | null)[]>(() => Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  
  // Game evaluation states
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // Score stats state
  const [scores, setScores] = useState<{ x: number; o: number; draws: number }>(() => {
    const saved = localStorage.getItem('tictactoe_scores');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.o === 'number' && typeof parsed.draws === 'number') {
          return parsed;
        }
      } catch (e) {
        // Ignore parsing errors and fallback
      }
    }
    return { x: 0, o: 0, draws: 0 };
  });

  // Match result popup trigger
  const [showResultBanner, setShowResultBanner] = useState(false);

  // Update sound manager mute state
  useEffect(() => {
    soundManager.setMute(isMuted);
    localStorage.setItem('tictactoe_muted', String(isMuted));
  }, [isMuted]);

  // Persist configurations
  useEffect(() => {
    localStorage.setItem('tictactoe_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tictactoe_gamemode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    localStorage.setItem('tictactoe_difficulty', aiDifficulty);
  }, [aiDifficulty]);

  useEffect(() => {
    localStorage.setItem('tictactoe_marker', playerMarker);
  }, [playerMarker]);

  // Handle move click
  const makeMove = useCallback((index: number, isAiCaller = false) => {
    // Prevent moves if cell filled, game finished, or AI is currently thinking
    if (board[index] || winner || isDraw || (aiThinking && !isAiCaller)) return;

    const currentMarker = isXNext ? 'X' : 'O';
    const newBoard = [...board];
    newBoard[index] = currentMarker;

    // Play synthesized pluck click
    soundManager.playClick(isXNext);

    setBoard(newBoard);

    // Evaluate game
    const winResult = checkWinner(newBoard);
    if (winResult.winner) {
      setWinner(winResult.winner);
      setWinningLine(winResult.line);
      soundManager.playWin();
      setShowResultBanner(true);

      setScores(prev => {
        const key = winResult.winner!.toLowerCase() as 'x' | 'o';
        const updated = {
          ...prev,
          [key]: prev[key] + 1
        };
        localStorage.setItem('tictactoe_scores', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (isBoardFull(newBoard)) {
      setIsDraw(true);
      soundManager.playDraw();
      setShowResultBanner(true);

      setScores(prev => {
        const updated = {
          ...prev,
          draws: prev.draws + 1
        };
        localStorage.setItem('tictactoe_scores', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    // Next turn
    setIsXNext(!isXNext);
  }, [board, isXNext, winner, isDraw, aiThinking]);

  // Trigger AI move if it is AI's turn
  useEffect(() => {
    if (winner || isDraw || gameMode !== 'ai') return;

    const isAiTurn = (isXNext && playerMarker === 'O') || (!isXNext && playerMarker === 'X');
    if (!isAiTurn) return;

    setAiThinking(true);
    const aiMarker = playerMarker === 'X' ? 'O' : 'X';

    // Snappy, highly responsive delay to make the AI moves feel instant yet natural
    const delay = 200;
    const timer = setTimeout(() => {
      const bestMove = getAIMove(board, aiMarker, aiDifficulty);
      if (bestMove !== -1) {
        makeMove(bestMove, true);
      }
      setAiThinking(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [board, isXNext, gameMode, aiDifficulty, playerMarker, winner, isDraw, makeMove]);

  // Restart / Play Again
  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setShowResultBanner(false);
    setAiThinking(false);
    
    // Always let X start
    setIsXNext(true);
    soundManager.playReset();
  };

  // Reset scores from storage
  const handleResetScores = () => {
    if (window.confirm('Are you sure you want to reset all wins and draws?')) {
      const reset = { x: 0, o: 0, draws: 0 };
      setScores(reset);
      localStorage.setItem('tictactoe_scores', JSON.stringify(reset));
      soundManager.playReset();
    }
  };

  // Dynamic values
  const currentTurnMarker = isXNext ? 'X' : 'O';
  const isAiCurrentlyPlaying = gameMode === 'ai' && (
    (isXNext && playerMarker === 'O') || (!isXNext && playerMarker === 'X')
  );

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col items-center justify-between transition-colors duration-500 px-4 py-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-hidden select-none">
        
        {/* Background Decorative Ambient Gradients (Neon/Sleek Theme) */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-400/10 dark:bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* --- HEADER CONTROL RAIL --- */}
        <header className="w-full max-w-md flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-white/45 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-pink-500 dark:from-cyan-400 dark:to-pink-400 bg-clip-text text-transparent">
              Neon-Glass 3D
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-white/45 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              id="btn-mute"
            >
              {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full bg-white/45 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              title="Toggle Light/Dark Theme"
              id="btn-theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* --- MAIN GAME HUB CARD --- */}
        <main className="w-full max-w-md flex flex-col gap-5 my-auto z-10 relative">
          
          {/* Game Title & Header Details */}
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
              TIC TAC TOE
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
              {gameMode === 'ai' 
                ? `VS Artificial Intelligence (${aiDifficulty.toUpperCase()})` 
                : '1v1 Local Player Mode'}
            </p>
          </div>

          {/* Core Configuration & Mode Selectors */}
          <div className="bg-white/60 dark:bg-slate-900/35 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/50">
              <button
                onClick={() => {
                  setGameMode('pvp');
                  handleRestart();
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                  gameMode === 'pvp'
                    ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-cyan-400 shadow-md border border-slate-200/50 dark:border-slate-700/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                id="mode-pvp"
              >
                <Users className="w-3.5 h-3.5" />
                Player vs Player
              </button>
              <button
                onClick={() => {
                  setGameMode('ai');
                  handleRestart();
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                  gameMode === 'ai'
                    ? 'bg-white dark:bg-slate-850 text-pink-600 dark:text-pink-400 shadow-md border border-slate-200/50 dark:border-slate-700/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                id="mode-ai"
              >
                <Cpu className="w-3.5 h-3.5" />
                vs AI Robot
              </button>
            </div>

            {/* Sub-configurations for AI opponent */}
            <AnimatePresence mode="wait">
              {gameMode === 'ai' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden flex flex-col gap-3"
                >
                  {/* Difficulty selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                      AI Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['easy', 'medium', 'impossible'] as const).map(diff => (
                        <button
                          key={diff}
                          onClick={() => {
                            setAiDifficulty(diff);
                            handleRestart();
                          }}
                          className={`py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all duration-300 cursor-pointer border ${
                            aiDifficulty === diff
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                              : 'bg-transparent border-slate-200/50 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                          }`}
                          id={`diff-${diff}`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marker selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                      Choose Your Marker
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setPlayerMarker('X');
                          handleRestart();
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-300 border cursor-pointer ${
                          playerMarker === 'X'
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                            : 'bg-transparent border-slate-200/50 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                        id="choose-x"
                      >
                        <span className="text-sm font-black">X</span> (First Move)
                      </button>
                      <button
                        onClick={() => {
                          setPlayerMarker('O');
                          handleRestart();
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-300 border cursor-pointer ${
                          playerMarker === 'O'
                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.15)]'
                            : 'bg-transparent border-slate-200/50 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                        id="choose-o"
                      >
                        <span className="text-sm font-black">O</span> (Second Move)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- TURN STATUS HUD --- */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  winner || isDraw 
                    ? 'bg-slate-400' 
                    : isXNext 
                      ? 'bg-blue-500 dark:bg-cyan-400' 
                      : 'bg-rose-500 dark:bg-pink-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  winner || isDraw 
                    ? 'bg-slate-400' 
                    : isXNext 
                      ? 'bg-blue-500 dark:bg-cyan-400' 
                      : 'bg-rose-500 dark:bg-pink-400'
                }`}></span>
              </div>
              <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                {winner ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> WINNER DECLARED
                  </span>
                ) : isDraw ? (
                  <span>MATCH DRAWN</span>
                ) : aiThinking ? (
                  <span className="animate-pulse flex items-center gap-1">
                    AI calculations... <Cpu className="w-3 h-3 animate-spin inline ml-0.5" />
                  </span>
                ) : gameMode === 'ai' ? (
                  isAiCurrentlyPlaying ? (
                    "AI Opponent's Turn"
                  ) : (
                    "Your Turn (Make Move)"
                  )
                ) : (
                  `Player ${currentTurnMarker}'s Turn`
                )}
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {!winner && !isDraw && (
                <span>
                  Active:{' '}
                  <span className={`font-black ml-1 ${
                    isXNext 
                      ? 'text-blue-600 dark:text-cyan-400' 
                      : 'text-rose-600 dark:text-pink-400'
                  }`}>
                    {currentTurnMarker}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* --- TIC TAC TOE BOARD GAME GRID --- */}
          <div className="relative">
            <div className="bg-slate-200/60 dark:bg-slate-900/50 backdrop-blur-md p-3.5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative">
              <div className="grid grid-cols-3 gap-3 relative">
                {board.map((cell, idx) => {
                  const isWinningCell = winningLine?.includes(idx);
                  const isFilled = cell !== null;

                  return (
                    <button
                      key={idx}
                      onClick={() => makeMove(idx)}
                      disabled={isFilled || !!winner || isDraw || aiThinking}
                      className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer ${
                        isWinningCell
                          ? 'bg-gradient-to-br from-amber-500/25 to-yellow-500/25 border-2 border-amber-400 dark:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-102 z-20'
                          : isFilled
                            ? 'bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80'
                            : 'bg-white/90 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800/70 hover:scale-103 hover:border-blue-400/50 dark:hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.12)] active:scale-97'
                      }`}
                      style={{ contentVisibility: 'auto' }}
                      id={`cell-${idx}`}
                    >
                      {/* Cell Content Animations */}
                      <AnimatePresence mode="popLayout">
                        {cell && (
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            transition={{ type: 'spring', damping: 11, stiffness: 180 }}
                            className="w-full h-full flex items-center justify-center font-black select-none"
                          >
                            {cell === 'X' ? (
                              <svg
                                className={`w-1/2 h-1/2 ${
                                  isWinningCell
                                    ? 'text-amber-500 dark:text-amber-400'
                                    : 'text-blue-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            ) : (
                              <svg
                                className={`w-1/2 h-1/2 ${
                                  isWinningCell
                                    ? 'text-amber-500 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]'
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                              </svg>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Subtle hover mark indicator (guide for players) */}
                      {!cell && !winner && !isDraw && !aiThinking && (
                        <div className={`absolute opacity-0 hover:opacity-15 transition-opacity duration-200 pointer-events-none w-1/2 h-1/2 ${
                          isXNext ? 'text-blue-500 dark:text-cyan-400' : 'text-rose-500 dark:text-pink-400'
                        }`}>
                          {isXNext ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- FULL BOARD OVERLAY STATE POPUP (Winner/Draw) --- */}
            <AnimatePresence>
              {showResultBanner && (winner || isDraw) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 rounded-3xl backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/80 flex flex-col items-center justify-center text-center p-6 z-30 shadow-2xl"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring' }}
                    className="flex flex-col items-center gap-4"
                  >
                    {winner ? (
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-yellow-500/30 blur-md animate-pulse" />
                        <div className="relative p-3.5 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                          <Trophy className="w-10 h-10 animate-bounce" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-full bg-slate-500 text-white shadow-lg shadow-slate-500/20">
                        <Zap className="w-10 h-10" />
                      </div>
                    )}

                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                        {winner ? (
                          gameMode === 'ai' ? (
                            (winner === playerMarker) ? "Victory is Yours!" : "AI Prevails!"
                          ) : (
                            `Player ${winner} Triumphs!`
                          )
                        ) : (
                          "Spectacular Draw!"
                        )}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 px-4 font-medium max-w-[240px]">
                        {winner 
                          ? `Winning cells successfully claimed in a perfect line!`
                          : 'A beautifully matched defense from both competitors.'}
                      </p>
                    </div>

                    <button
                      onClick={handleRestart}
                      className="mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-500 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/20"
                      id="btn-play-again"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Play Again
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- SCOREBOARD WIDGET --- */}
          <div className="bg-white/60 dark:bg-slate-900/35 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Leaderboard stats
              </span>
              <button
                onClick={handleResetScores}
                className="text-[10px] font-extrabold uppercase text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors duration-200 cursor-pointer"
                title="Reset All Records"
                id="btn-reset-scores"
              >
                Reset Records
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Score Player X */}
              <div className="bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-slate-800/50 p-2.5 rounded-xl text-center">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                  Player X {gameMode === 'ai' && playerMarker === 'X' && <User className="w-2.5 h-2.5 inline" />}
                </p>
                <p className="text-xl font-black text-blue-600 dark:text-cyan-400 mt-1">
                  {scores.x}
                </p>
              </div>

              {/* Score Draws */}
              <div className="bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-slate-800/50 p-2.5 rounded-xl text-center">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                  Draws
                </p>
                <p className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
                  {scores.draws}
                </p>
              </div>

              {/* Score Player O */}
              <div className="bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-slate-800/50 p-2.5 rounded-xl text-center">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                  Player O {gameMode === 'ai' && playerMarker === 'O' && <User className="w-2.5 h-2.5 inline" />}
                </p>
                <p className="text-xl font-black text-rose-600 dark:text-pink-400 mt-1">
                  {scores.o}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Restart Board Action (When Game Active) */}
          <div className="flex justify-center">
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-blue-500 dark:hover:text-cyan-400 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              id="btn-restart-board"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Board
            </button>
          </div>

        </main>

        {/* --- FOOTER BRAGGING --- */}
        <footer className="w-full max-w-md text-center mt-6 z-10">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <span>Responsive 3D Grid</span>
            <span>•</span>
            <span>Programmatic Web Audio API</span>
            <span>•</span>
            <span>Advanced Minimax AI</span>
          </p>
        </footer>

      </div>
    </div>
  );
}
