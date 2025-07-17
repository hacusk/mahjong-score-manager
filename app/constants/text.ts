// UI Labels
export const LABELS = {
  // Game actions
  START_GAME: "ゲーム開始",
  NEW_GAME: "新規ゲーム",
  NEXT_ROUND: "次局へ",
  CONFIRM: "確定",
  EDIT_NAMES: "名前を編集",
  CONFIRM_NAMES: "名前を確定",

  // Win types
  TSUMO: "ツモ",
  RON: "ロン",
  DRAW: "流局",

  // Player roles
  DEALER: "親",
  RIICHI_STATUS: "リーチ中",
  RIICHI_ACTION: "リーチ",

  // Game info
  GAME_TITLE: "麻雀点数計算",
  GAME_ENDED: "ゲーム終了",
  SCORE_INPUT: "点数入力",
  GAME_HISTORY: "対局履歴",
  GAME_STATS: "対局統計",

  // Form labels
  WINNER: "和了者",
  LOSER: "放銃者",
  RESULT: "結果",
  SELECT_TENPAI: "聴牌者を選択",

  // Statistics
  FINAL_SCORE: "最終得点",
  RANK: "順位",
  RIICHI_COUNT: "リーチ回数",
  WIN_COUNT: "和了回数",
  DEAL_IN_COUNT: "放銃回数",
  DRAW_COUNT: "流局回数",
  TOTAL_RIICHI: "総リーチ回数",
  TOTAL_WINS: "総和了回数",
  TOTAL_DEAL_INS: "総放銃回数",
  TOTAL_DRAWS: "総流局回数",

  // Player placeholder
  PLAYER_NAME_PLACEHOLDER: "プレイヤー名",
} as const;

// Game descriptions
export const GAME_DESCRIPTIONS = {
  NO_HISTORY: "まだ対局履歴がありません",
  GAME_END_MESSAGE:
    "麻雀ゲームが終了しました。\n新しいゲームを開始するには「新規ゲーム」ボタンを押してください。",
  RIICHI_AUTO_TENPAI: "リーチ中のプレイヤーは自動的に聴牌になります",
  RIICHI_DEPOSIT_NOTE: "※リーチ棒は供託へ",
} as const;

// Draw descriptions
export const DRAW_TYPES = {
  ALL_TENPAI: "流局 (全員聴牌)",
  ALL_NOTEN: "流局 (全員ノーテン)",
  PARTIAL_TENPAI: (tenpaiPlayers: string[]) =>
    `流局 (聴牌: ${tenpaiPlayers.join(", ")})`,
} as const;

// Score breakdown labels
export const SCORE_BREAKDOWN = {
  TENPAI_BONUS: "聴牌料",
  NOTEN_PENALTY: "不聴罰符",
  RIICHI_STICK: "リーチ棒",
} as const;

// Wind names
export const WINDS = ["東", "南", "西", "北"] as const;

// Round names helper
export const getRoundName = (round: number): string => {
  if (round <= 4) return `東${round}局`;
  if (round <= 8) return `南${round - 4}局`;
  if (round <= 12) return `西${round - 8}局`;
  return `北${round - 12}局`;
};

// Honba display helper
export const getHonbaText = (honba: number): string => `${honba}本場`;

// Deposit display helper
export const getDepositText = (sticks: number): string => `供託${sticks}本`;
