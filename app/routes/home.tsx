import type { Route } from "./+types/home";
import { useGameState } from "../hooks/useGameState";
import { ScoreBoard } from "../components/ScoreBoard";
import { ScoreInput } from "../components/ScoreInput";
import { GameHistory } from "../components/GameHistory";
import { GameStats } from "../components/GameStats";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "麻雀点数計算" },
    { name: "description", content: "麻雀の点数を記録・表示するWEBアプリケーション" },
  ];
}

export default function Home() {
  const {
    gameState,
    startNewGame,
    updatePlayerName,
    updateScores,
    nextRound,
    addRiichiStick,
    clearRiichiSticks,
    declareRiichi,
    checkGameEnd,
    calculatePlayerStats,
  } = useGameState();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 space-y-6">
        <ScoreBoard
          gameState={gameState}
          onUpdatePlayerName={updatePlayerName}
          onStartNewGame={startNewGame}
          onDeclareRiichi={declareRiichi}
        />
        
        {gameState.gameStarted && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScoreInput
                players={gameState.players}
                dealerWins={gameState.dealerWins}
                riichiSticks={gameState.riichiSticks}
                carryOverRiichiSticks={gameState.carryOverRiichiSticks}
                gamePhase={gameState.gamePhase}
                gameEnded={gameState.gameEnded}
                onScoreUpdate={(scoreChanges, description, dealerWon, wasDraw, winnerId, loserId, winType) => 
                  updateScores(scoreChanges, description, dealerWon, wasDraw, winnerId, loserId, winType)
                }
                onNextRound={nextRound}
                onAddRiichiStick={addRiichiStick}
                onClearRiichiSticks={clearRiichiSticks}
                onDeclareRiichi={declareRiichi}
              />
              
              <GameHistory
                history={gameState.history}
                players={gameState.players}
              />
            </div>
            
            {gameState.gameEnded && (
              <GameStats
                players={gameState.players}
                playerStats={calculatePlayerStats()}
                gameHistory={gameState.history}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
