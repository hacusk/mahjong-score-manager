import { GAME_CONSTANTS } from "../constants/game";
import { LABELS } from "../constants/text";
import type { GameRound, GameSettings, Player, PlayerStats } from "../types/game";

interface GameStatsProps {
  players: Player[];
  playerStats: { [playerId: string]: PlayerStats };
  gameHistory: GameRound[];
  settings: GameSettings;
}

interface SettlementResult {
  player: Player;
  rank: number;
  rawScore: number;
  basePt: number;   // (素点 - 返し点) / 100 の端数調整済み
  okaPt: number;    // 1位のみオカを加算
  umaPt: number;    // ウマ
  totalPt: number;  // 最終pt
}

const { RETURN_SCORE } = GAME_CONSTANTS;

const RANK_CARD_COLORS = [
  "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600",
  "bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600",
  "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600",
  "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600",
];

const RANK_BADGE_COLORS = [
  "bg-yellow-400 text-yellow-900",
  "bg-gray-300 text-gray-800",
  "bg-orange-400 text-orange-900",
  "bg-red-400 text-red-900",
];

function calculateSettlement(
  players: Player[],
  settings: GameSettings,
): SettlementResult[] {
  const { uma, initialScore, hasOka } = settings;

  // 点数順にソート（同点は id 昇順）
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  // 全員の basePt を (素点 - 返し点) / 1000 で計算（小数点第1位まで）
  const basePts = sorted.map((p) => Math.round((p.score - RETURN_SCORE) / 100) / 10);

  // オカ = (返し点 - 初期持ち点) × 4 / 1000（オカなしの場合は 0）
  const okaPt = hasOka ? ((RETURN_SCORE - initialScore) * 4) / 1000 : 0;

  return sorted.map((player, index) => {
    const rank = index + 1;
    const basePt = basePts[index];
    const thisOkaPt = rank === 1 ? okaPt : 0;
    const umaPt = uma[index];
    const totalPt = basePt + thisOkaPt + umaPt;

    return {
      player,
      rank,
      rawScore: player.score,
      basePt,
      okaPt: thisOkaPt,
      umaPt,
      totalPt,
    };
  });
}

function formatPt(pt: number): string {
  if (pt > 0) return `+${pt.toFixed(1)}`;
  return pt.toFixed(1);
}

export function GameStats({
  players,
  playerStats,
  gameHistory,
  settings,
}: GameStatsProps) {
  const totalDraws = gameHistory.filter((round) => round.winType === "draw").length;
  const settlement = calculateSettlement(players, settings);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        最終結果
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        オカ: {settings.hasOka ? `あり（返し点${RETURN_SCORE.toLocaleString()}点）` : "なし"} &nbsp;|&nbsp;
        ウマ: {settings.uma[0] > 0 ? `+${settings.uma[0]}` : settings.uma[0]}/
        {settings.uma[1] > 0 ? `+${settings.uma[1]}` : settings.uma[1]}/
        {settings.uma[2]}/{settings.uma[3]}
      </p>

      {/* 精算結果カード: 2×2 グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {settlement.map((result) => {
          const ptColor =
            result.totalPt > 0
              ? "text-green-600 dark:text-green-400"
              : result.totalPt < 0
                ? "text-red-500 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300";

          return (
            <div
              key={result.player.id}
              className={`rounded-xl border-2 p-4 ${RANK_CARD_COLORS[result.rank - 1]}`}
            >
              {/* 順位バッジ + プレイヤー名 */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${RANK_BADGE_COLORS[result.rank - 1]}`}
                >
                  {result.rank}
                </span>
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                  {result.player.name}
                </span>
              </div>

              {/* 素点 */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">素点</span>
                <span className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {result.rawScore.toLocaleString()}
                </span>
              </div>

              {/* 内訳 */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-0.5">
                <div>基本: {formatPt(result.basePt)}pt</div>
                {result.okaPt !== 0 && (
                  <div>オカ: +{result.okaPt.toFixed(1)}pt</div>
                )}
                {result.umaPt !== 0 && (
                  <div>ウマ: {result.umaPt > 0 ? `+${result.umaPt}` : result.umaPt}pt</div>
                )}
              </div>

              {/* 最終pt（大きく） */}
              <div className={`text-3xl font-extrabold ${ptColor}`}>
                {formatPt(result.totalPt)}
                <span className="text-base font-semibold ml-1">pt</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 統計セクション */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          統計
        </h3>

        {/* プレイヤー別統計テーブル */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                  プレイヤー
                </th>
                <th className="text-center py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                  {LABELS.RIICHI_COUNT}
                </th>
                <th className="text-center py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                  {LABELS.WIN_COUNT}
                </th>
                <th className="text-center py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                  {LABELS.DEAL_IN_COUNT}
                </th>
              </tr>
            </thead>
            <tbody>
              {settlement.map(({ player, rank }) => {
                const stats = playerStats[player.id] || {
                  riichiCount: 0,
                  winCount: 0,
                  dealInCount: 0,
                };
                return (
                  <tr
                    key={player.id}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${RANK_BADGE_COLORS[rank - 1]}`}
                        >
                          {rank}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {stats.riichiCount}
                    </td>
                    <td className="py-2 px-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {stats.winCount}
                    </td>
                    <td className="py-2 px-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {stats.dealInCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {LABELS.TOTAL_RIICHI}
            </h4>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {Object.values(playerStats).reduce((sum, s) => sum + s.riichiCount, 0)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {LABELS.TOTAL_WINS}
            </h4>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {Object.values(playerStats).reduce((sum, s) => sum + s.winCount, 0)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {LABELS.TOTAL_DEAL_INS}
            </h4>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {Object.values(playerStats).reduce((sum, s) => sum + s.dealInCount, 0)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {LABELS.TOTAL_DRAWS}
            </h4>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {totalDraws}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
