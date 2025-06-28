import { useState } from 'react';
import type { GameState } from '../hooks/useGameState';
import { PlayerScore } from './PlayerScore';

interface ScoreBoardProps {
  gameState: GameState;
  onUpdatePlayerName: (playerId: string, name: string) => void;
  onStartNewGame: () => void;
  onDeclareRiichi: (playerId: string) => void;
}

export function ScoreBoard({ gameState, onUpdatePlayerName, onStartNewGame, onDeclareRiichi }: ScoreBoardProps) {
  const [isEditingNames, setIsEditingNames] = useState(!gameState.gameStarted);
  
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const playerRanks = new Map(sortedPlayers.map((player, index) => [player.id, index + 1]));

  const getRoundName = (round: number) => {
    if (round <= 4) return `東${round}局`;
    if (round <= 8) return `南${round - 4}局`;
    if (round <= 12) return `西${round - 8}局`;
    return `北${round - 12}局`;
  };

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
                <span className="text-red-600 dark:text-red-400 font-semibold">ゲーム終了</span>
              ) : (
                <>
                  {getRoundName(gameState.currentRound)} {gameState.dealerWins}本場
                  {gameState.carryOverRiichiSticks > 0 && ` 供託: ${gameState.carryOverRiichiSticks}本`}
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
                {isEditingNames ? '名前を確定' : '名前を編集'}
              </button>
            )}
            
            <button
              onClick={onStartNewGame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {gameState.gameStarted ? '新規ゲーム' : 'ゲーム開始'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gameState.players.map((player) => (
            <PlayerScore
              key={player.id}
              player={player}
              rank={playerRanks.get(player.id) || 0}
              onNameChange={(name) => onUpdatePlayerName(player.id, name)}
              isEditing={isEditingNames}
              onDeclareRiichi={() => onDeclareRiichi(player.id)}
              gameStarted={gameState.gameStarted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}