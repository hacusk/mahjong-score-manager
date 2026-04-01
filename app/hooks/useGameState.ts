import { useEffect, useState } from "react";
import { GAME_CONSTANTS, WINDS } from "../constants/game";
import type {
  GameRound,
  GameSettings,
  GameState,
  LastRoundResult,
  Player,
  PlayerStats,
} from "../types/game";
import {
  getNextDealerIndex,
  isSouthFour,
  rotateWinds,
  shouldEndGame,
} from "../utils/gameHelpers";

const STORAGE_KEY = "mahjong-game-state";

const DEFAULT_SETTINGS: GameSettings = {
  initialScore: 25000, // オカあり = 25,000点スタート
  drawHonbaIncrement: 1,
  playerNames: ["東家", "南家", "西家", "北家"],
  uma: [20, 10, -10, -20],
  hasOka: true,
};

const makeInitialState = (settings: GameSettings = DEFAULT_SETTINGS): GameState => ({
  players: [
    {
      id: "1",
      name: settings.playerNames[0],
      score: settings.initialScore,
      isDealer: true,
      wind: "東",
      isRiichi: false,
    },
    {
      id: "2",
      name: settings.playerNames[1],
      score: settings.initialScore,
      isDealer: false,
      wind: "南",
      isRiichi: false,
    },
    {
      id: "3",
      name: settings.playerNames[2],
      score: settings.initialScore,
      isDealer: false,
      wind: "西",
      isRiichi: false,
    },
    {
      id: "4",
      name: settings.playerNames[3],
      score: settings.initialScore,
      isDealer: false,
      wind: "北",
      isRiichi: false,
    },
  ],
  currentRound: 1,
  dealerWins: 0,
  riichiSticks: 0,
  carryOverRiichiSticks: 0,
  history: [],
  gameStarted: false,
  gameEnded: false,
  gamePhase: "playing",
  settings,
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.history = parsed.history.map((round: any) => ({
            ...round,
            timestamp: new Date(round.timestamp),
          }));
          // 旧データにsettingsがない場合はデフォルト値を付与
          if (!parsed.settings) {
            parsed.settings = DEFAULT_SETTINGS;
          }
          // 旧データに uma / hasOka がない場合は fallback
          if (!parsed.settings.uma) {
            parsed.settings.uma = [20, 10, -10, -20];
          }
          if (parsed.settings.hasOka === undefined) {
            parsed.settings.hasOka = true;
          }
          // 旧データの returnScore は不要なので削除
          delete parsed.settings.returnScore;
          return parsed;
        } catch (e) {
          console.error("Failed to parse saved game state:", e);
        }
      }
    }
    return makeInitialState();
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const startNewGame = (settings: GameSettings) => {
    setGameState({
      ...makeInitialState(settings),
      gameStarted: true,
    });
  };

  const resetToSetup = () => {
    setGameState(makeInitialState());
  };

  const updatePlayerName = (playerId: string, name: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, name } : p,
      ),
    }));
  };

  const updateScores = (
    scoreChanges: { [playerId: string]: number },
    description: string,
    dealerWon: boolean,
    wasDraw: boolean = false,
    winnerId?: string,
    loserId?: string,
    winType?: "tsumo" | "ron" | "draw",
  ) => {
    setGameState((prev) => {
      const newPlayers = prev.players.map((player) => ({
        ...player,
        score: player.score + (scoreChanges[player.id] || 0),
      }));

      // この局でリーチしたプレイヤーを記録
      const riichiDeclarers = prev.players
        .filter((p) => p.isRiichi)
        .map((p) => p.id);

      const newHistory: GameRound = {
        round: prev.currentRound,
        dealerWins: prev.dealerWins,
        riichiSticks: prev.riichiSticks,
        carryOverRiichiSticks: prev.carryOverRiichiSticks,
        scores: scoreChanges,
        description,
        timestamp: new Date(),
        riichiDeclarers,
        winnerId,
        loserId,
        winType,
      };

      return {
        ...prev,
        players: newPlayers,
        history: [...prev.history, newHistory],
        gamePhase: "scored",
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
      const drawIncrement = prev.settings.drawHonbaIncrement;

      if (wasDraw) {
        if (dealerWon) {
          // 親がテンパイの場合は連荘
          return {
            ...prev,
            dealerWins: prev.dealerWins + drawIncrement,
            gamePhase: "playing",
            lastRoundResult: undefined,
            riichiSticks: 0,
            carryOverRiichiSticks: prev.riichiSticks,
            players: prev.players.map((player) => ({
              ...player,
              isRiichi: false,
            })),
          };
        } else {
          // 親がノーテンの場合は親流れ

          // 南4局で親がノーテンの場合はゲーム終了
          if (isSouthFour(prev.currentRound)) {
            return {
              ...prev,
              gameEnded: true,
              gamePhase: "playing",
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
            dealerWins: prev.dealerWins + drawIncrement,
            gamePhase: "playing",
            lastRoundResult: undefined,
            riichiSticks: 0,
            carryOverRiichiSticks: prev.riichiSticks,
          };
        }
      }

      if (dealerWon) {
        // 親の和了時の連荘
        return {
          ...prev,
          dealerWins: prev.dealerWins + 1,
          gamePhase: "playing",
          lastRoundResult: undefined,
          riichiSticks: 0,
          carryOverRiichiSticks: 0,
          players: prev.players.map((player) => ({
            ...player,
            isRiichi: false,
          })),
        };
      }

      // 子の和了の場合は親流れ、本場リセット

      // 南4局で子が和了した場合はゲーム終了
      if (isSouthFour(prev.currentRound)) {
        return {
          ...prev,
          gameEnded: true,
          gamePhase: "playing",
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
        dealerWins: 0,
        gamePhase: "playing",
        lastRoundResult: undefined,
        riichiSticks: 0,
        carryOverRiichiSticks: 0,
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
          ? {
              ...player,
              isRiichi: true,
              score: player.score - GAME_CONSTANTS.RIICHI_COST,
            }
          : player,
      ),
      riichiSticks: prev.riichiSticks + 1,
    }));
  };

  const cancelRiichi = (playerId: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              isRiichi: false,
              score: player.score + GAME_CONSTANTS.RIICHI_COST,
            }
          : player,
      ),
      riichiSticks: Math.max(0, prev.riichiSticks - 1),
    }));
  };

  const checkGameEnd = () => {
    return shouldEndGame(gameState.players, gameState.currentRound);
  };

  const calculatePlayerStats = (): { [playerId: string]: PlayerStats } => {
    const stats: { [playerId: string]: PlayerStats } = {};

    // Initialize stats for all players
    gameState.players.forEach((player) => {
      stats[player.id] = {
        riichiCount: 0,
        winCount: 0,
        dealInCount: 0,
      };
    });

    // Calculate stats from history
    gameState.history.forEach((round) => {
      // Count riichi declarations
      if (round.riichiDeclarers) {
        round.riichiDeclarers.forEach((playerId) => {
          if (stats[playerId]) {
            stats[playerId].riichiCount++;
          }
        });
      }

      // Count wins (only tsumo and ron, exclude draws)
      if (
        round.winnerId &&
        stats[round.winnerId] &&
        (round.winType === "tsumo" || round.winType === "ron")
      ) {
        stats[round.winnerId].winCount++;
      }

      // Count deal-ins (only for ron)
      if (round.winType === "ron" && round.loserId && stats[round.loserId]) {
        stats[round.loserId].dealInCount++;
      }
    });

    return stats;
  };

  return {
    gameState,
    startNewGame,
    resetToSetup,
    updatePlayerName,
    updateScores,
    nextRound,
    addRiichiStick,
    clearRiichiSticks,
    declareRiichi,
    cancelRiichi,
    checkGameEnd,
    calculatePlayerStats,
  };
};
