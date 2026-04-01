import { useState } from "react";
import type { GameState } from "../types/game";
import { getRoundName } from "../utils/gameHelpers";
import { PlayerScore } from "./PlayerScore";

interface ScoreBoardProps {
  gameState: GameState;
  onUpdatePlayerName: (playerId: string, name: string) => void;
  onNewGame: () => void; // ゲーム設定画面に戻る
}

export function ScoreBoard({
  gameState,
  onUpdatePlayerName,
  onNewGame,
}: ScoreBoardProps) {
  const [isEditingNames, setIsEditingNames] = useState(false);

  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.score - a.score,
  );
  const playerRanks = new Map(
    sortedPlayers.map((player, index) => [player.id, index + 1]),
  );

  const totalRiichiSticks =
    gameState.riichiSticks + gameState.carryOverRiichiSticks;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
      {/* ヘッダーバー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          {gameState.gameEnded ? (
            <span className="text-base font-bold text-red-600 dark:text-red-400">
              ゲーム終了
            </span>
          ) : (
            <>
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                {getRoundName(gameState.currentRound)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {gameState.dealerWins}本場
              </span>
              {totalRiichiSticks > 0 && (
                <span className="text-sm font-medium text-orange-500 dark:text-orange-400">
                  供託{totalRiichiSticks}本
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditingNames(!isEditingNames)}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors min-h-[36px]"
          >
            {isEditingNames ? "確定" : "名前編集"}
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg transition-colors min-h-[36px]"
          >
            新規ゲーム
          </button>
        </div>
      </div>

      {/* プレイヤーグリッド */}
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {gameState.players.map((player) => (
          <PlayerScore
            key={player.id}
            player={player}
            rank={playerRanks.get(player.id) ?? 0}
            allPlayers={gameState.players}
            onNameChange={(name) => onUpdatePlayerName(player.id, name)}
            isEditing={isEditingNames}
          />
        ))}
      </div>
    </div>
  );
}
