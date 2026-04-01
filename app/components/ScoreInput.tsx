import { useEffect, useState } from "react";
import type { WinType } from "../constants/game";
import { GAME_CONSTANTS, SCORE_TABLES } from "../constants/game";
import { GAME_DESCRIPTIONS } from "../constants/text";
import type { Player, ScoreChanges } from "../types/game";
import {
  calculateDrawScoreChanges,
  calculateRonScoreChanges,
  calculateTsumoScoreChanges,
  getTsumoPayments,
} from "../utils/gameHelpers";

interface ScoreInputProps {
  players: Player[];
  dealerWins: number;
  riichiSticks: number;
  carryOverRiichiSticks: number;
  gamePhase: "playing" | "scored" | "between_rounds";
  gameEnded: boolean;
  onScoreUpdate: (
    scoreChanges: ScoreChanges,
    description: string,
    dealerWon: boolean,
    wasDraw?: boolean,
    winnerId?: string,
    loserId?: string,
    winType?: "tsumo" | "ron" | "draw",
  ) => void;
  onNextRound: () => void;
  onDeclareRiichi: (playerId: string) => void;
  onCancelRiichi: (playerId: string) => void;
}

// 点数セレクタのオプション型
type ScoreOption = {
  label: string;
  value: number;
  tsumo: string;
  desc: string;
};

export function ScoreInput({
  players,
  dealerWins,
  riichiSticks,
  carryOverRiichiSticks,
  gamePhase,
  gameEnded,
  onScoreUpdate,
  onNextRound,
  onDeclareRiichi,
  onCancelRiichi,
}: ScoreInputProps) {
  const [winType, setWinType] = useState<WinType>("tsumo");
  const [winnerId, setWinnerId] = useState<string>(players[0].id);
  const [loserId, setLoserId] = useState<string>(players[1].id);
  const [selectedScore, setSelectedScore] = useState<number>(8000);
  const [tenpaiPlayers, setTenpaiPlayers] = useState<string[]>([]);

  // リーチ中のプレイヤーは自動的に聴牌に含める
  const riichiPlayerIds = players.filter((p) => p.isRiichi).map((p) => p.id);
  const effectiveTenpaiPlayers = [
    ...new Set([...tenpaiPlayers, ...riichiPlayerIds]),
  ];

  const dealer = players.find((p) => p.isDealer);
  const isWinnerDealer = winnerId === dealer?.id;
  const scoreOptions: readonly ScoreOption[] = isWinnerDealer
    ? SCORE_TABLES.dealer
    : SCORE_TABLES.child;

  useEffect(() => {
    setSelectedScore(isWinnerDealer ? 12000 : 8000);
  }, [isWinnerDealer]);

  useEffect(() => {
    if (winType === "ron" && loserId === winnerId) {
      const available = players.filter((p) => p.id !== winnerId);
      if (available.length > 0) {
        setLoserId(available[0].id);
      }
    }
  }, [winnerId, winType, loserId, players]);

  const handleSubmit = () => {
    let scoreChanges: ScoreChanges = {};
    let description = "";
    const winner = players.find((p) => p.id === winnerId);
    const loser = players.find((p) => p.id === loserId);

    if (winType === "tsumo") {
      scoreChanges = calculateTsumoScoreChanges(
        players,
        winnerId,
        selectedScore,
        dealerWins,
        riichiSticks,
        carryOverRiichiSticks,
      );
      const { dealerPay, childPay } = getTsumoPayments(selectedScore, isWinnerDealer);
      if (isWinnerDealer) {
        description = `${winner?.name}がツモ (子${childPay}オール)`;
      } else {
        description = `${winner?.name}がツモ (子${childPay}/親${dealerPay})`;
      }
    } else if (winType === "ron") {
      scoreChanges = calculateRonScoreChanges(
        players,
        winnerId,
        loserId,
        selectedScore,
        dealerWins,
        riichiSticks,
        carryOverRiichiSticks,
      );
      description = `${winner?.name}が${loser?.name}からロン (${selectedScore}点)`;
    } else {
      scoreChanges = calculateDrawScoreChanges(players, effectiveTenpaiPlayers);
      const tenpaiCount = effectiveTenpaiPlayers.length;
      if (tenpaiCount > 0 && tenpaiCount < 4) {
        description = `流局 (聴牌: ${effectiveTenpaiPlayers
          .map((id) => players.find((p) => p.id === id)?.name)
          .join(", ")})`;
      } else {
        description =
          tenpaiCount === 4 ? "流局 (全員聴牌)" : "流局 (全員ノーテン)";
      }
    }

    if (dealerWins > 0) {
      description += ` ${dealerWins}本場`;
    }

    let dealerWon = false;
    if (winType === "draw") {
      dealerWon = effectiveTenpaiPlayers.includes(dealer?.id ?? "");
    } else {
      dealerWon = isWinnerDealer;
    }

    onScoreUpdate(
      scoreChanges,
      description,
      dealerWon,
      winType === "draw",
      winnerId,
      loserId,
      winType,
    );
    setSelectedScore(8000);
    setTenpaiPlayers([]);
  };

  if (gameEnded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 p-6 text-center">
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          ゲーム終了
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
          {GAME_DESCRIPTIONS.GAME_END_MESSAGE}
        </p>
      </div>
    );
  }

  // 次局ボタン表示フェーズ
  if (gamePhase === "scored") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 p-6 flex flex-col gap-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          点数が確定しました
        </p>
        <button
          type="button"
          onClick={onNextRound}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-bold rounded-xl transition-colors min-h-[56px]"
        >
          次局へ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 overflow-hidden">
      {/* リーチ宣言セクション */}
      <section className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
          リーチ宣言
        </p>
        <div className="grid grid-cols-2 gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {player.name}
                {player.isDealer && (
                  <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                    (親)
                  </span>
                )}
              </span>
              {player.isRiichi ? (
                <button
                  type="button"
                  onClick={() => onCancelRiichi(player.id)}
                  className="shrink-0 px-2.5 py-1 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/50 dark:hover:bg-red-800/60 dark:text-red-300 rounded-md transition-colors min-h-[32px]"
                >
                  取消
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onDeclareRiichi(player.id)}
                  className="shrink-0 px-2.5 py-1 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-md transition-colors min-h-[32px]"
                >
                  リーチ
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 局結果入力セクション */}
      <section className="p-4 space-y-4">
        {/* ツモ/ロン/流局 タブ */}
        <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1">
          {(["tsumo", "ron", "draw"] as const).map((type) => {
            const label = type === "tsumo" ? "ツモ" : type === "ron" ? "ロン" : "流局";
            return (
              <button
                key={type}
                type="button"
                onClick={() => setWinType(type)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] ${
                  winType === type
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 流局: 聴牌選択 */}
        {winType === "draw" && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              聴牌者を選択
            </p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => {
                const isTenpai = effectiveTenpaiPlayers.includes(player.id);
                const isLocked = player.isRiichi;
                return (
                  <button
                    key={player.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      if (tenpaiPlayers.includes(player.id)) {
                        setTenpaiPlayers(tenpaiPlayers.filter((id) => id !== player.id));
                      } else {
                        setTenpaiPlayers([...tenpaiPlayers, player.id]);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] text-left ${
                      isTenpai
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    } ${isLocked ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {player.name}
                    {player.isRiichi && (
                      <span className="ml-1 text-xs opacity-80">(リーチ)</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {GAME_DESCRIPTIONS.RIICHI_AUTO_TENPAI}
            </p>
          </div>
        )}

        {/* ツモ/ロン: 和了者・放銃者 */}
        {winType !== "draw" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                和了者
              </label>
              <div className="flex flex-col gap-1.5">
                {players.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => setWinnerId(player.id)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors text-left min-h-[40px] ${
                      winnerId === player.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>

            {winType === "ron" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  放銃者
                </label>
                <div className="flex flex-col gap-1.5">
                  {players
                    .filter((p) => p.id !== winnerId)
                    .map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => setLoserId(player.id)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors text-left min-h-[40px] ${
                          loserId === player.id
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {player.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 点数選択グリッド */}
        {winType !== "draw" && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              点数 {isWinnerDealer ? "（親）" : "（子）"}
            </p>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {scoreOptions.map((score) => (
                <button
                  key={score.value}
                  type="button"
                  onClick={() => setSelectedScore(score.value)}
                  className={`p-2 rounded-lg text-xs transition-colors text-center min-h-[52px] ${
                    selectedScore === score.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="font-bold text-sm leading-tight">{score.label}</div>
                  <div className="text-xs mt-0.5 opacity-70 leading-tight">{score.desc}</div>
                  {winType === "tsumo" && (
                    <div className="text-xs mt-0.5 opacity-80 leading-tight">{score.tsumo}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 確定ボタン */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-base font-bold rounded-xl transition-colors min-h-[56px]"
        >
          確定
        </button>
      </section>
    </div>
  );
}
