import { GameHistory } from "../components/GameHistory";
import { GameSetup } from "../components/GameSetup";
import { GameStats } from "../components/GameStats";
import { ScoreBoard } from "../components/ScoreBoard";
import { ScoreInput } from "../components/ScoreInput";
import { useGameState } from "../hooks/useGameState";
import type { GameSettings } from "../types/game";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "麻雀点数計算" },
    {
      name: "description",
      content: "麻雀の点数を記録・表示するWEBアプリケーション",
    },
  ];
}

export default function Home() {
  const {
    gameState,
    startNewGame,
    resetToSetup,
    updatePlayerName,
    updateScores,
    nextRound,
    declareRiichi,
    cancelRiichi,
    calculatePlayerStats,
  } = useGameState();

  const handleStartGame = (settings: GameSettings) => {
    startNewGame(settings);
  };

  // ゲーム未開始 → 設定画面を表示
  if (!gameState.gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  const handleNewGame = () => resetToSetup();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">
        {/* 上段: スコアボード */}
        <ScoreBoard
          gameState={gameState}
          onUpdatePlayerName={updatePlayerName}
          onNewGame={handleNewGame}
        />

        {/* 下段: 2カラム（点数入力 + 対局履歴） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ScoreInput
            players={gameState.players}
            dealerWins={gameState.dealerWins}
            riichiSticks={gameState.riichiSticks}
            carryOverRiichiSticks={gameState.carryOverRiichiSticks}
            gamePhase={gameState.gamePhase}
            gameEnded={gameState.gameEnded}
            onScoreUpdate={(
              scoreChanges,
              description,
              dealerWon,
              wasDraw,
              winnerId,
              loserId,
              winType,
            ) =>
              updateScores(
                scoreChanges,
                description,
                dealerWon,
                wasDraw,
                winnerId,
                loserId,
                winType,
              )
            }
            onNextRound={nextRound}
            onDeclareRiichi={declareRiichi}
            onCancelRiichi={cancelRiichi}
          />

          <GameHistory
            history={gameState.history}
            players={gameState.players}
          />
        </div>

        {/* ゲーム終了後: 統計表示 */}
        {gameState.gameEnded && (
          <GameStats
            players={gameState.players}
            playerStats={calculatePlayerStats()}
            gameHistory={gameState.history}
            settings={gameState.settings}
          />
        )}
      </div>
    </div>
  );
}
