import type { Player } from '../../types/game';
import { LABELS, GAME_DESCRIPTIONS } from '../../constants/text';
import { GRID_LAYOUTS } from '../../constants/ui';

interface TenpaiSelectorProps {
  players: Player[];
  tenpaiPlayers: string[];
  onTenpaiChange: (playerId: string, isTenpai: boolean) => void;
  effectiveTenpaiPlayers: string[];
}

export function TenpaiSelector({ 
  players, 
  tenpaiPlayers, 
  onTenpaiChange, 
  effectiveTenpaiPlayers 
}: TenpaiSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {LABELS.SELECT_TENPAI}
      </label>
      <div className={GRID_LAYOUTS.TENPAI_SELECTION}>
        {players.map(player => (
          <label 
            key={player.id} 
            className={`flex items-center gap-2 ${
              player.isRiichi ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={effectiveTenpaiPlayers.includes(player.id)}
              disabled={player.isRiichi}
              onChange={(e) => {
                if (!player.isRiichi) {
                  onTenpaiChange(player.id, e.target.checked);
                }
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="text-gray-700 dark:text-gray-300">
              {player.name} ({player.wind})
              {player.isRiichi && (
                <span className="text-red-600 text-xs ml-1">({LABELS.RIICHI_STATUS})</span>
              )}
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {GAME_DESCRIPTIONS.RIICHI_AUTO_TENPAI}
      </p>
    </div>
  );
}