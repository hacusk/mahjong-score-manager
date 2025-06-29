import type { Player, PlayerStats } from '../types/game';

interface GameStatsProps {
  players: Player[];
  playerStats: { [playerId: string]: PlayerStats };
}

export function GameStats({ players, playerStats }: GameStatsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        対局統計
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                プレイヤー
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                最終得点
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                順位
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                リーチ回数
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                和了回数
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                放銃回数
              </th>
            </tr>
          </thead>
          <tbody>
            {players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => {
                const stats = playerStats[player.id] || { riichiCount: 0, winCount: 0, dealInCount: 0 };
                const rank = index + 1;
                
                return (
                  <tr key={player.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                          ${player.wind === '東' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            player.wind === '南' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            player.wind === '西' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}
                        `}>
                          {player.wind}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-bold ${
                        player.score >= 30000 ? 'text-green-600 dark:text-green-400' :
                        player.score >= 20000 ? 'text-gray-900 dark:text-gray-100' :
                        player.score >= 10000 ? 'text-orange-600 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {player.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                        rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {stats.riichiCount}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {stats.winCount}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {stats.dealInCount}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            総リーチ回数
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Object.values(playerStats).reduce((sum, stats) => sum + stats.riichiCount, 0)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            総和了回数
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Object.values(playerStats).reduce((sum, stats) => sum + stats.winCount, 0)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            総放銃回数
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Object.values(playerStats).reduce((sum, stats) => sum + stats.dealInCount, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}