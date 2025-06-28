import type { Wind, GamePhase } from '../constants/game';

export interface Player {
  id: string;
  name: string;
  score: number;
  isDealer: boolean;
  wind: Wind;
  isRiichi: boolean;
}

export interface GameRound {
  round: number;
  dealerWins: number;
  riichiSticks: number;
  carryOverRiichiSticks?: number; // この局開始時の供託リーチ棒数（オプション）
  scores: { [playerId: string]: number };
  description: string;
  timestamp: Date;
  riichiDeclarers?: string[]; // この局でリーチした人のID（オプション）
}

export interface LastRoundResult {
  dealerWon: boolean;
  description: string;
  wasDraw: boolean;
}

export interface GameState {
  players: Player[];
  currentRound: number;
  dealerWins: number;
  riichiSticks: number;
  carryOverRiichiSticks: number; // 前局から持ち越された供託リーチ棒
  history: GameRound[];
  gameStarted: boolean;
  gameEnded: boolean;
  gamePhase: GamePhase;
  lastRoundResult?: LastRoundResult;
}

export interface ScoreChanges {
  [playerId: string]: number;
}

export interface TsumoPayment {
  dealerPay: number;
  childPay: number;
}