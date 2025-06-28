import type { Player } from '../hooks/useGameState';

interface PlayerScoreProps {
  player: Player;
  rank: number;
  onNameChange?: (name: string) => void;
  isEditing?: boolean;
  onDeclareRiichi?: () => void;
  gameStarted?: boolean;
}

export function PlayerScore({ player, rank, onNameChange, isEditing = false, onDeclareRiichi, gameStarted = false }: PlayerScoreProps) {
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      case 4: return '💀';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 30000) return 'text-green-600 dark:text-green-400';
    if (score >= 20000) return 'text-gray-900 dark:text-gray-100';
    if (score >= 10000) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getWindColor = (wind: string) => {
    switch (wind) {
      case '東': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case '南': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '西': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '北': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return '';
    }
  };

  return (
    <div className={`
      relative p-6 rounded-lg shadow-lg transition-all duration-300
      ${player.isDealer ? 'bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400' : 'bg-white dark:bg-gray-800'}
    `}>
      <div className="absolute top-2 right-2 text-2xl">{getRankEmoji(rank)}</div>
      
      <div className="flex items-center gap-3 mb-4">
        <span className={`
          inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold
          ${getWindColor(player.wind)}
        `}>
          {player.wind}
        </span>
        
        {isEditing ? (
          <input
            type="text"
            value={player.name}
            onChange={(e) => onNameChange?.(e.target.value)}
            className="flex-1 px-3 py-1 text-lg font-semibold bg-gray-100 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="プレイヤー名"
          />
        ) : (
          <h3 className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {player.name}
          </h3>
        )}
        
        {player.isDealer && (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 rounded">
            親
          </span>
        )}
      </div>
      
      <div className="text-center">
        <div className={`text-3xl font-bold ${getScoreColor(player.score)}`}>
          {player.score.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {player.score >= 30000 ? '+' : ''}{(player.score - 25000).toLocaleString()}
        </div>
        
        {player.isRiichi && (
          <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium">
            リーチ中
          </div>
        )}
        
        {gameStarted && !player.isRiichi && onDeclareRiichi && (
          <button
            onClick={onDeclareRiichi}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
          >
            リーチ
          </button>
        )}
      </div>
    </div>
  );
}