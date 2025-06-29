// ゲーム設定の定数
export const GAME_CONSTANTS = {
  INITIAL_SCORE: 25000,
  RIICHI_COST: 1000,
  RIICHI_STICK_VALUE: 1000,
  HONBA_BONUS_TOTAL: 300,
  HONBA_INDIVIDUAL: 100,
  DRAW_BONUS_TOTAL: 3000,
  SOUTH_FOUR_ROUND: 8,
  MAX_ROUNDS: 8,
} as const;

// 風の定義
export const WINDS = ['東', '南', '西', '北'] as const;
export type Wind = typeof WINDS[number];

// ゲームフェーズの定義
export type GamePhase = 'playing' | 'scored' | 'between_rounds';

// 和了タイプの定義
export type WinType = 'tsumo' | 'ron' | 'draw';

// 点数オプションの型定義
export interface ScoreOption {
  label: string;
  value: number;
  tsumo: string;
  desc: string;
}

// 点数表の定義
export const SCORE_TABLES = {
  child: [
    { label: '1000', value: 1000, tsumo: '親500/子300', desc: '30符1翻' },
    { label: '1300', value: 1300, tsumo: '親700/子400', desc: '40符1翻' },
    { label: '1600', value: 1600, tsumo: '親800/子400', desc: '50符1翻・七対子' },
    { label: '2000', value: 2000, tsumo: '親1000/子500', desc: '30符/60符1翻' },
    { label: '2300', value: 2300, tsumo: '親1200/子600', desc: '70符1翻' },
    { label: '2600', value: 2600, tsumo: '親1300/子700', desc: '40符2翻' },
    { label: '3200', value: 3200, tsumo: '親1600/子800', desc: '50符2翻' },
    { label: '3900', value: 3900, tsumo: '親2000/子1000', desc: '30符3翻' },
    { label: '4500', value: 4500, tsumo: '親2300/子1200', desc: '70符2翻' },
    { label: '5200', value: 5200, tsumo: '親2600/子1300', desc: '40符3翻' },
    { label: '6400', value: 6400, tsumo: '親3200/子1600', desc: '50符3翻' },
    { label: '7700', value: 7700, tsumo: '親3900/子2000', desc: '30符4翻' },
    { label: '満貫 8000', value: 8000, tsumo: '親4000/子2000', desc: '5翻以上' },
    { label: '跳満 12000', value: 12000, tsumo: '親6000/子3000', desc: '6-7翻' },
    { label: '倍満 16000', value: 16000, tsumo: '親8000/子4000', desc: '8-10翻' },
    { label: '三倍満 24000', value: 24000, tsumo: '親12000/子6000', desc: '11-12翻' },
    { label: '役満 32000', value: 32000, tsumo: '親16000/子8000', desc: '13翻以上' },
  ],
  dealer: [
    { label: '1500', value: 1500, tsumo: '子500オール', desc: '30符1翻' },
    { label: '2000', value: 2000, tsumo: '子700オール', desc: '40符1翻' },
    { label: '2400', value: 2400, tsumo: '子800オール', desc: '50符1翻・七対子' },
    { label: '2900', value: 2900, tsumo: '子1000オール', desc: '30符/60符1翻' },
    { label: '3400', value: 3400, tsumo: '子1200オール', desc: '70符1翻' },
    { label: '3900', value: 3900, tsumo: '子1300オール', desc: '40符2翻' },
    { label: '4800', value: 4800, tsumo: '子1600オール', desc: '50符2翻' },
    { label: '5800', value: 5800, tsumo: '子2000オール', desc: '30符3翻' },
    { label: '6800', value: 6800, tsumo: '子2300オール', desc: '70符2翻' },
    { label: '7700', value: 7700, tsumo: '子2600オール', desc: '40符3翻' },
    { label: '9600', value: 9600, tsumo: '子3200オール', desc: '50符3翻' },
    { label: '11600', value: 11600, tsumo: '子3900オール', desc: '30符4翻' },
    { label: '満貫 12000', value: 12000, tsumo: '子4000オール', desc: '5翻以上' },
    { label: '跳満 18000', value: 18000, tsumo: '子6000オール', desc: '6-7翻' },
    { label: '倍満 24000', value: 24000, tsumo: '子8000オール', desc: '8-10翻' },
    { label: '三倍満 36000', value: 36000, tsumo: '子12000オール', desc: '11-12翻' },
    { label: '役満 48000', value: 48000, tsumo: '子16000オール', desc: '13翻以上' },
  ],
} as const;

// ツモ時の支払い額テーブル
export const TSUMO_PAYMENTS = {
  child: {
    1000: [500, 300],   // [親の支払い, 子の支払い]
    1300: [700, 400],
    1600: [800, 400],
    2000: [1000, 500],
    2300: [1200, 600],
    2600: [1300, 700],
    3200: [1600, 800],
    3900: [2000, 1000],
    4500: [2300, 1200],
    5200: [2600, 1300],
    6400: [3200, 1600],
    7700: [3900, 2000],
    8000: [4000, 2000],
    12000: [6000, 3000],
    16000: [8000, 4000],
    24000: [12000, 6000],
    32000: [16000, 8000],
  },
  dealer: {
    1500: 500,   // 子の支払い（オール）
    2000: 700,
    2400: 800,
    2900: 1000,
    3400: 1200,
    3900: 1300,
    4800: 1600,
    5800: 2000,
    6800: 2300,
    7700: 2600,
    9600: 3200,
    11600: 3900,
    12000: 4000,
    18000: 6000,
    24000: 8000,
    36000: 12000,
    48000: 16000,
  },
} as const;