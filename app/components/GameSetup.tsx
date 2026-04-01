import { useState } from "react";
import type { GameSettings } from "../types/game";

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void;
}

const WIND_LABELS = ["東家", "南家", "西家", "北家"] as const;

type UmaPreset = "none" | "5-10" | "10-20" | "10-30";

const UMA_PRESETS: { label: string; key: UmaPreset; values: [number, number, number, number] }[] = [
  { label: "なし (0-0)", key: "none", values: [0, 0, 0, 0] },
  { label: "5-10", key: "5-10", values: [10, 5, -5, -10] },
  { label: "10-20", key: "10-20", values: [20, 10, -10, -20] },
  { label: "10-30", key: "10-30", values: [30, 10, -10, -30] },
];

// オカあり → 25,000点スタート・返し30,000（オカ +20pt）
// オカなし → 30,000点スタート・返し30,000（オカなし）
const INITIAL_SCORE_BY_OKA: Record<"oka" | "noka", number> = {
  oka: 25000,
  noka: 30000,
};

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState<[string, string, string, string]>([
    "東家", "南家", "西家", "北家",
  ]);
  const [drawHonbaIncrement, setDrawHonbaIncrement] = useState<1 | 2>(1);
  const [umaPreset, setUmaPreset] = useState<UmaPreset>("10-20");
  const [hasOka, setHasOka] = useState<boolean>(true);

  const handleSubmit = () => {
    const uma = UMA_PRESETS.find((p) => p.key === umaPreset)?.values ?? [20, 10, -10, -20];
    const initialScore = hasOka ? INITIAL_SCORE_BY_OKA.oka : INITIAL_SCORE_BY_OKA.noka;
    const settings: GameSettings = {
      initialScore,
      drawHonbaIncrement,
      playerNames,
      uma,
      hasOka,
    };
    onStartGame(settings);
  };

  const updatePlayerName = (index: number, value: string) => {
    const next = [...playerNames] as [string, string, string, string];
    next[index] = value;
    setPlayerNames(next);
  };

  const btnClass = (active: boolean) =>
    `py-3 rounded-lg text-sm font-semibold transition-colors min-h-[44px] ${
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
            麻雀点数計算
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
            ゲームを開始する前に設定を確認してください
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* プレイヤー名 */}
          <section className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
              プレイヤー名
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {playerNames.map((name, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {WIND_LABELS[index]}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    placeholder={WIND_LABELS[index]}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[44px]"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 流局時の本場加算 */}
          <section className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
              流局時の本場加算
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              流局した際に本場をいくつ増やすか
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setDrawHonbaIncrement(1)} className={btnClass(drawHonbaIncrement === 1)}>
                +1本（標準）
              </button>
              <button type="button" onClick={() => setDrawHonbaIncrement(2)} className={btnClass(drawHonbaIncrement === 2)}>
                +2本
              </button>
            </div>
          </section>

          {/* ウマ・オカ設定 */}
          <section className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
              ウマ・オカ設定
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              ゲーム終了時の精算に使用します
            </p>

            {/* オカ */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                オカ
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                あり = 25,000点スタート・返し30,000（+20pt）&nbsp;/&nbsp;なし = 30,000点スタート
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setHasOka(true)} className={btnClass(hasOka)}>
                  あり（25,000点）
                </button>
                <button type="button" onClick={() => setHasOka(false)} className={btnClass(!hasOka)}>
                  なし（30,000点）
                </button>
              </div>
            </div>

            {/* ウマ */}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                ウマ（順位ボーナス）
              </p>
              <div className="grid grid-cols-2 gap-2">
                {UMA_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setUmaPreset(preset.key)}
                    className={btnClass(umaPreset === preset.key)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 開始ボタン */}
          <div className="p-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg font-bold rounded-xl shadow-sm transition-colors min-h-[56px]"
            >
              ゲーム開始
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
