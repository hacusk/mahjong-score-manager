import type { Player } from "../types/game";

interface PlayerScoreProps {
  player: Player;
  rank: number;
  allPlayers: Player[];
  onNameChange?: (name: string) => void;
  isEditing?: boolean;
}

const WIND_COLORS: Record<string, string> = {
  東: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  南: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  西: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  北: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-orange-400",
  4: "text-gray-500",
};

const RANK_NUMERALS = ["", "1st", "2nd", "3rd", "4th"];

function getScoreColor(score: number): string {
  if (score >= 30000) return "text-green-600 dark:text-green-400";
  if (score >= 20000) return "text-gray-900 dark:text-gray-100";
  if (score >= 10000) return "text-orange-500 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function PlayerScore({
  player,
  rank,
  allPlayers,
  onNameChange,
  isEditing = false,
}: PlayerScoreProps) {
  const windColor = WIND_COLORS[player.wind] ?? "";
  const rankColor = RANK_COLORS[rank] ?? "text-gray-500";

  return (
    <div
      className={`
        relative flex flex-col p-4 rounded-xl transition-all duration-200
        ${player.isDealer
          ? "bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400"
          : "bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700"}
      `}
    >
      {/* ヘッダー行：風・名前・親バッジ */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-base font-bold shrink-0 ${windColor}`}
        >
          {player.wind}
        </span>

        {isEditing ? (
          <input
            type="text"
            value={player.name}
            onChange={(e) => onNameChange?.(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1 text-base font-semibold bg-gray-100 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="プレイヤー名"
          />
        ) : (
          <span className="flex-1 min-w-0 text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {player.name}
          </span>
        )}

        {player.isDealer && (
          <span className="shrink-0 px-1.5 py-0.5 text-xs font-bold bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 rounded">
            親
          </span>
        )}

        {player.isRiichi && (
          <span className="shrink-0 px-1.5 py-0.5 text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
            リーチ
          </span>
        )}
      </div>

      {/* 点数表示 */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-bold tabular-nums ${getScoreColor(player.score)}`}>
          {player.score.toLocaleString()}
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${rankColor}`}>
          {RANK_NUMERALS[rank]}
        </span>
      </div>

      {/* 他プレイヤーとの差分 */}
      <div className="space-y-0.5">
        {allPlayers
          .filter((p) => p.id !== player.id)
          .sort((a, b) => b.score - a.score)
          .map((other) => {
            const diff = player.score - other.score;
            return (
              <div key={other.id} className="flex justify-between items-center text-xs">
                <span className="text-gray-400 dark:text-gray-500 truncate mr-2">
                  {other.name}
                </span>
                <span
                  className={`font-medium tabular-nums ${
                    diff >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {diff >= 0 ? "+" : ""}
                  {diff.toLocaleString()}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
