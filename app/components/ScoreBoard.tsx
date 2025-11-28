import { useState } from "react";
import {
  INITIAL_SCORE_OPTIONS,
  type InitialScore,
} from "../constants/game";
import type { GameState } from "../types/game";
import { getRoundName } from "../utils/gameHelpers";
import { PlayerScore } from "./PlayerScore";

interface ScoreBoardProps {
  gameState: GameState;
  onUpdatePlayerName: (playerId: string, name: string) => void;
  onStartNewGame: (initialScore: InitialScore) => void;
  onDeclareRiichi: (playerId: string) => void;
}

export function ScoreBoard({
  gameState,
  onUpdatePlayerName,
  onStartNewGame,
  onDeclareRiichi,
}: ScoreBoardProps) {
  const [isEditingNames, setIsEditingNames] = useState(!gameState.gameStarted);
  const [showStartModal, setShowStartModal] = useState(false);

  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.score - a.score,
  );
  const playerRanks = new Map(
    sortedPlayers.map((player, index) => [player.id, index + 1]),
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              麻雀点数計算
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {gameState.gameEnded ? (
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  ゲーム終了
                </span>
              ) : (
                <>
                  {getRoundName(gameState.currentRound)} {gameState.dealerWins}
                  本場
                  {gameState.carryOverRiichiSticks > 0 &&
                    ` 供託: ${gameState.carryOverRiichiSticks}本`}
                </>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            {gameState.gameStarted && (
              <button
                onClick={() => setIsEditingNames(!isEditingNames)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {isEditingNames ? "名前を確定" : "名前を編集"}
              </button>
            )}

            <button
              onClick={() => setShowStartModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {gameState.gameStarted ? "新規ゲーム" : "ゲーム開始"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gameState.players.map((player) => (
            <PlayerScore
              key={player.id}
              player={player}
              rank={playerRanks.get(player.id) || 0}
              allPlayers={gameState.players}
              onNameChange={(name) => onUpdatePlayerName(player.id, name)}
              isEditing={isEditingNames}
              onDeclareRiichi={() => onDeclareRiichi(player.id)}
              gameStarted={gameState.gameStarted}
            />
          ))}
        </div>
      </div>

      {/* 初期持ち点選択モーダル */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              初期持ち点を選択
            </h2>
            <div className="flex flex-col gap-3">
              {INITIAL_SCORE_OPTIONS.map((score) => (
                <button
                  key={score}
                  onClick={() => {
                    onStartNewGame(score);
                    setShowStartModal(false);
                  }}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-lg font-medium"
                >
                  {score.toLocaleString()}点
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStartModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
