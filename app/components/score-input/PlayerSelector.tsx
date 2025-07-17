import { LABELS } from "../../constants/text";
import type { Player } from "../../types/game";

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerId: string;
  onPlayerChange: (playerId: string) => void;
  label: string;
  excludePlayerId?: string;
}

export function PlayerSelector({
  players,
  selectedPlayerId,
  onPlayerChange,
  label,
  excludePlayerId,
}: PlayerSelectorProps) {
  const availablePlayers = excludePlayerId
    ? players.filter((p) => p.id !== excludePlayerId)
    : players;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={selectedPlayerId}
        onChange={(e) => onPlayerChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availablePlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name} ({player.wind})
          </option>
        ))}
      </select>
    </div>
  );
}
