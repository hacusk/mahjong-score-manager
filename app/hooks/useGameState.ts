import { useState, useEffect } from 'react';
import { GAME_CONSTANTS, WINDS } from '../constants/game';
import type { Player, GameState, GameRound, LastRoundResult } from '../types/game';
import { 
  getRoundName, 
  getNextDealerIndex, 
  rotateWinds, 
  isSouthFour, 
  shouldEndGame 
} from '../utils/gameHelpers';
const STORAGE_KEY = 'mahjong-game-state';

const initialState: GameState = {
  players: [
    { id: '1', name: '東家', score: GAME_CONSTANTS.INITIAL_SCORE, isDealer: true, wind: '東', isRiichi: false },
    { id: '2', name: '南家', score: GAME_CONSTANTS.INITIAL_SCORE, isDealer: false, wind: '南', isRiichi: false },
    { id: '3', name: '西家', score: GAME_CONSTANTS.INITIAL_SCORE, isDealer: false, wind: '西', isRiichi: false },
    { id: '4', name: '北家', score: GAME_CONSTANTS.INITIAL_SCORE, isDealer: false, wind: '北', isRiichi: false },
  ],
  currentRound: 1,
  dealerWins: 0,
  riichiSticks: 0,
  carryOverRiichiSticks: 0,
  history: [],
  gameStarted: false,
  gameEnded: false,
  gamePhase: 'playing',
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.history = parsed.history.map((round: any) => ({
            ...round,
            timestamp: new Date(round.timestamp),
          }));
          return parsed;
        } catch (e) {
          console.error('Failed to parse saved game state:', e);
        }
      }
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const startNewGame = () => {
    setGameState({
      ...initialState,
      gameStarted: true,
      gameEnded: false,
      gamePhase: 'playing',
      carryOverRiichiSticks: 0,
      players: gameState.players.map((p, index) => ({
        ...p,
        score: GAME_CONSTANTS.INITIAL_SCORE,
        isDealer: index === 0,
        wind: WINDS[index],
        isRiichi: false,
      })),
    });
  };

  const updatePlayerName = (playerId: string, name: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, name } : p
      ),
    }));
  };

  const updateScores = (
    scoreChanges: { [playerId: string]: number },
    description: string,
    dealerWon: boolean,
    wasDraw: boolean = false
  ) => {
    setGameState((prev) => {
      const newPlayers = prev.players.map((player) => ({
        ...player,
        score: player.score + (scoreChanges[player.id] || 0),
      }));

      // この局でリーチしたプレイヤーを記録
      const riichiDeclarers = prev.players.filter(p => p.isRiichi).map(p => p.id);

      const newHistory: GameRound = {
        round: prev.currentRound,
        dealerWins: prev.dealerWins,
        riichiSticks: prev.riichiSticks,
        carryOverRiichiSticks: prev.carryOverRiichiSticks,
        scores: scoreChanges,
        description,
        timestamp: new Date(),
        riichiDeclarers,
      };

      return {
        ...prev,
        players: newPlayers,
        history: [...prev.history, newHistory],
        gamePhase: 'scored',
        lastRoundResult: {
          dealerWon,
          description,
          wasDraw,
        },
      };
    });
  };

  const nextRound = () => {
    setGameState((prev) => {
      if (!prev.lastRoundResult) return prev;
      
      const { dealerWon, wasDraw } = prev.lastRoundResult;
      
      if (wasDraw) {
        // 流局の場合は必ず本場+2
        if (dealerWon) {
          // 親がテンパイの場合は連荘
          return {
            ...prev,
            dealerWins: prev.dealerWins + 2,
            gamePhase: 'playing',
            lastRoundResult: undefined,
            riichiSticks: 0, // 新しい局では現在のリーチ棒をリセット
            carryOverRiichiSticks: prev.riichiSticks, // 前局のリーチ棒を供託として持ち越し
            players: prev.players.map(player => ({
              ...player,
              isRiichi: false, // 新しい局ではリーチ状態をリセット
            })),
          };
        } else {
          // 親がノーテンの場合は親流れだが本場は+2
          
          // 南4局で親がノーテンの場合はゲーム終了
          if (isSouthFour(prev.currentRound)) {
            return {
              ...prev,
              gameEnded: true,
              gamePhase: 'playing',
              lastRoundResult: undefined,
            };
          }
          
          const currentDealerIndex = prev.players.findIndex((p) => p.isDealer);
          const nextDealerIndex = getNextDealerIndex(currentDealerIndex);
          const rotatedPlayers = rotateWinds(prev.players, nextDealerIndex);

          return {
            ...prev,
            players: rotatedPlayers,
            currentRound: prev.currentRound + 1,
            dealerWins: prev.dealerWins + 2, // 流局時は必ず本場+2
            gamePhase: 'playing',
            lastRoundResult: undefined,
            riichiSticks: 0, // 新しい局では現在のリーチ棒をリセット
            carryOverRiichiSticks: prev.riichiSticks, // 前局のリーチ棒を供託として持ち越し
          };
        }
      }
      
      if (dealerWon) {
        // 和了時の連荘
        return {
          ...prev,
          dealerWins: prev.dealerWins + 1,
          gamePhase: 'playing',
          lastRoundResult: undefined,
          riichiSticks: 0, // 和了があった場合はリーチ棒をクリア
          carryOverRiichiSticks: 0, // 和了があった場合は供託もクリア
          players: prev.players.map(player => ({
            ...player,
            isRiichi: false, // 新しい局ではリーチ状態をリセット
          })),
        };
      }

      // 子の和了の場合は親流れ、本場リセット
      
      // 南4局で子が和了した場合はゲーム終了
      if (isSouthFour(prev.currentRound)) {
        return {
          ...prev,
          gameEnded: true,
          gamePhase: 'playing',
          lastRoundResult: undefined,
        };
      }
      
      const currentDealerIndex = prev.players.findIndex((p) => p.isDealer);
      const nextDealerIndex = getNextDealerIndex(currentDealerIndex);
      const rotatedPlayers = rotateWinds(prev.players, nextDealerIndex);

      return {
        ...prev,
        players: rotatedPlayers,
        currentRound: prev.currentRound + 1,
        dealerWins: 0, // 子の和了時は本場リセット
        gamePhase: 'playing',
        lastRoundResult: undefined,
        riichiSticks: 0, // 和了があった場合はリーチ棒をクリア
        carryOverRiichiSticks: 0, // 和了があった場合は供託もクリア
      };
    });
  };

  const addRiichiStick = () => {
    setGameState((prev) => ({
      ...prev,
      riichiSticks: prev.riichiSticks + 1,
    }));
  };

  const clearRiichiSticks = () => {
    setGameState((prev) => ({
      ...prev,
      riichiSticks: 0,
    }));
  };

  const declareRiichi = (playerId: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId
          ? { ...player, isRiichi: true, score: player.score - GAME_CONSTANTS.RIICHI_COST }
          : player
      ),
      riichiSticks: prev.riichiSticks + 1,
    }));
  };


  const checkGameEnd = () => {
    return shouldEndGame(gameState.players, gameState.currentRound);
  };

  return {
    gameState,
    startNewGame,
    updatePlayerName,
    updateScores,
    nextRound,
    addRiichiStick,
    clearRiichiSticks,
    declareRiichi,
    checkGameEnd,
  };
};