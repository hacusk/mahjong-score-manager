import type { GamePhase, Wind } from "../constants/game";

export interface GameSettings {
  initialScore: number;
  drawHonbaIncrement: 1 | 2; // 流局時の本場加算数
  playerNames: [string, string, string, string];
  uma: [number, number, number, number]; // 順位ウマ [1位, 2位, 3位, 4位]（単位: pt）
  hasOka: boolean; // オカあり = 返し点30,000固定でオカ計算
}

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
  winnerId?: string; // 和了者のID（ツモ・ロンの場合）
  loserId?: string; // 放銃者のID（ロンの場合）
  winType?: "tsumo" | "ron" | "draw"; // 局の結果タイプ
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
  settings: GameSettings;
}

export interface ScoreChanges {
  [playerId: string]: number;
}

export interface TsumoPayment {
  dealerPay: number;
  childPay: number;
}

export interface PlayerStats {
  riichiCount: number;
  winCount: number;
  dealInCount: number;
}
