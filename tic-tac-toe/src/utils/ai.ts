/**
 * AI Opponent logic for Tic Tac Toe
 * Implements Easy, Medium, and Impossible (Minimax) levels.
 */

import { WINNING_COMBINATIONS } from './gameLogic';

/**
 * Check if the board has a winner and return the winner and winning line.
 */
export function checkWinner(board: (string | null)[]): { winner: string | null; line: number[] | null } {
  for (const line of WINNING_COMBINATIONS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

/**
 * Check if the board is full (draw)
 */
export function isBoardFull(board: (string | null)[]): boolean {
  return board.every(cell => cell !== null);
}

/**
 * Get all available empty indices on the board
 */
function getEmptyIndices(board: (string | null)[]): number[] {
  return board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((val): val is number => val !== null);
}

/**
 * MINIMAX Algorithm for the Impossible AI
 */
interface MinimaxResult {
  score: number;
  index: number;
}

function minimax(
  board: (string | null)[],
  depth: number,
  isMaximizing: boolean,
  aiMarker: string,
  humanMarker: string
): MinimaxResult {
  const { winner } = checkWinner(board);

  // Base cases
  if (winner === aiMarker) return { score: 10 - depth, index: -1 };
  if (winner === humanMarker) return { score: depth - 10, index: -1 };
  if (isBoardFull(board)) return { score: 0, index: -1 };

  const emptyIndices = getEmptyIndices(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestIndex = -1;

    for (const idx of emptyIndices) {
      board[idx] = aiMarker;
      const result = minimax(board, depth + 1, false, aiMarker, humanMarker);
      board[idx] = null; // undo

      if (result.score > bestScore) {
        bestScore = result.score;
        bestIndex = idx;
      }
    }
    return { score: bestScore, index: bestIndex };
  } else {
    let bestScore = Infinity;
    let bestIndex = -1;

    for (const idx of emptyIndices) {
      board[idx] = humanMarker;
      const result = minimax(board, depth + 1, true, aiMarker, humanMarker);
      board[idx] = null; // undo

      if (result.score < bestScore) {
        bestScore = result.score;
        bestIndex = idx;
      }
    }
    return { score: bestScore, index: bestIndex };
  }
}

/**
 * Main AI function to determine the next move
 */
export function getAIMove(
  board: (string | null)[],
  aiMarker: string,
  difficulty: 'easy' | 'medium' | 'impossible'
): number {
  const emptyIndices = getEmptyIndices(board);
  if (emptyIndices.length === 0) return -1;

  // Fast-path optimization: if board is empty, pick the strategic center cell instantly
  if (emptyIndices.length === 9) {
    return 4; // The center is mathematically the strongest opener
  }

  const humanMarker = aiMarker === 'X' ? 'O' : 'X';

  // 1. EASY: Random move
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
  }

  // 2. MEDIUM: 60% chance to play minimax/smart, 40% chance random
  if (difficulty === 'medium') {
    // If there is an immediate winning move, take it (100% of the time, to look smart)
    for (const idx of emptyIndices) {
      const tempBoard = [...board];
      tempBoard[idx] = aiMarker;
      if (checkWinner(tempBoard).winner === aiMarker) {
        return idx;
      }
    }

    // If there is an immediate block needed, block it (100% of the time)
    for (const idx of emptyIndices) {
      const tempBoard = [...board];
      tempBoard[idx] = humanMarker;
      if (checkWinner(tempBoard).winner === humanMarker) {
        return idx;
      }
    }

    // Otherwise, 50% chance of random, 50% chance of optimal
    if (Math.random() > 0.5) {
      const result = minimax([...board], 0, true, aiMarker, humanMarker);
      return result.index !== -1 ? result.index : emptyIndices[0];
    } else {
      const randomIndex = Math.floor(Math.random() * emptyIndices.length);
      return emptyIndices[randomIndex];
    }
  }

  // 3. IMPOSSIBLE (Minimax)
  const result = minimax([...board], 0, true, aiMarker, humanMarker);
  return result.index !== -1 ? result.index : emptyIndices[0];
}
