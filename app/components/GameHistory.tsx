import type { GameRound, Player } from '../hooks/useGameState';

interface GameHistoryProps {
  history: GameRound[];
  players: Player[];
}

export function GameHistory({ history, players }: GameHistoryProps) {
  const getRoundName = (round: number) => {
    if (round <= 4) return `東${round}局`;
    if (round <= 8) return `南${round - 4}局`;
    if (round <= 12) return `西${round - 8}局`;
    return `北${round - 12}局`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col h-[400px]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          対局履歴
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            まだ対局履歴がありません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col h-[400px]">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        対局履歴
      </h2>
      
      <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
        {history.map((round, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {getRoundName(round.round)}
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {round.dealerWins}本場
                </span>
                <span className="ml-2 text-sm text-orange-600 dark:text-orange-400">
                  供託{round.carryOverRiichiSticks || 0}本
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatTime(round.timestamp)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {round.description}
            </p>
            
            {round.riichiDeclarers && round.riichiDeclarers.length > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                リーチ: {round.riichiDeclarers.map(id => 
                  players.find(p => p.id === id)?.name
                ).filter(Boolean).join(', ')}
              </p>
            )}
            
            <div className="grid grid-cols-4 gap-2 text-sm">
              {players.map((player) => {
                const change = round.scores[player.id] || 0;
                return (
                  <div key={player.id} className="text-center">
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      {player.name}
                    </div>
                    <div
                      className={`font-medium ${
                        change > 0
                          ? 'text-green-600 dark:text-green-400'
                          : change < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {change > 0 && '+'}
                      {change.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}