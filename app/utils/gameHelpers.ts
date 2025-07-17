import { GAME_CONSTANTS, TSUMO_PAYMENTS, WINDS } from "../constants/game";
import type { Player, ScoreChanges, TsumoPayment } from "../types/game";

/**
 * 局名を取得
 */
export const getRoundName = (round: number): string => {
  if (round <= 4) return `東${round}局`;
  if (round <= 8) return `南${round - 4}局`;
  if (round <= 12) return `西${round - 8}局`;
  return `北${round - 12}局`;
};

/**
 * 次の親のインデックスを取得
 */
export const getNextDealerIndex = (currentDealerIndex: number): number => {
  return (currentDealerIndex + 1) % 4;
};

/**
 * 風を回転させてプレイヤーを更新
 */
export const rotateWinds = (
  players: Player[],
  nextDealerIndex: number,
  resetRiichi = true,
): Player[] => {
  return players.map((player, index) => ({
    ...player,
    isDealer: index === nextDealerIndex,
    wind: WINDS[(index - nextDealerIndex + 4) % 4],
    isRiichi: resetRiichi ? false : player.isRiichi,
  }));
};

/**
 * ツモ時の支払い額を計算
 */
export const getTsumoPayments = (
  score: number,
  isDealer: boolean,
): TsumoPayment => {
  if (isDealer) {
    // 親の場合は子全員が同額を支払う
    const childPay =
      TSUMO_PAYMENTS.dealer[score as keyof typeof TSUMO_PAYMENTS.dealer] || 0;
    return { dealerPay: 0, childPay };
  } else {
    // 子の場合は親と他の子で支払い額が異なる
    const payments = TSUMO_PAYMENTS.child[
      score as keyof typeof TSUMO_PAYMENTS.child
    ] || [0, 0];
    return { dealerPay: payments[0], childPay: payments[1] };
  }
};

/**
 * ツモ時の点数計算
 */
export const calculateTsumoScoreChanges = (
  players: Player[],
  winnerId: string,
  selectedScore: number,
  dealerWins: number,
  riichiSticks: number,
  carryOverRiichiSticks: number,
): ScoreChanges => {
  const scoreChanges: ScoreChanges = {};
  const honbaBonus = dealerWins * GAME_CONSTANTS.HONBA_BONUS_TOTAL;
  const tableRiichiSticks =
    (riichiSticks + carryOverRiichiSticks) * GAME_CONSTANTS.RIICHI_STICK_VALUE;

  const winner = players.find((p) => p.id === winnerId);
  const isWinnerDealer = winner?.isDealer || false;
  const { dealerPay, childPay } = getTsumoPayments(
    selectedScore,
    isWinnerDealer,
  );
  const honbaPerPlayer = dealerWins * GAME_CONSTANTS.HONBA_INDIVIDUAL;

  if (isWinnerDealer) {
    // 親のツモ
    players.forEach((player) => {
      if (player.id === winnerId) {
        scoreChanges[player.id] = childPay * 3 + honbaBonus + tableRiichiSticks;
      } else {
        scoreChanges[player.id] = -(childPay + honbaPerPlayer);
      }
    });
  } else {
    // 子のツモ
    players.forEach((player) => {
      if (player.id === winnerId) {
        scoreChanges[player.id] =
          dealerPay + childPay * 2 + honbaBonus + tableRiichiSticks;
      } else if (player.isDealer) {
        scoreChanges[player.id] = -(dealerPay + honbaPerPlayer);
      } else {
        scoreChanges[player.id] = -(childPay + honbaPerPlayer);
      }
    });
  }

  return scoreChanges;
};

/**
 * ロン時の点数計算
 */
export const calculateRonScoreChanges = (
  players: Player[],
  winnerId: string,
  loserId: string,
  selectedScore: number,
  dealerWins: number,
  riichiSticks: number,
  carryOverRiichiSticks: number,
): ScoreChanges => {
  const scoreChanges: ScoreChanges = {};
  const honbaBonus = dealerWins * GAME_CONSTANTS.HONBA_BONUS_TOTAL;
  const tableRiichiSticks =
    (riichiSticks + carryOverRiichiSticks) * GAME_CONSTANTS.RIICHI_STICK_VALUE;

  players.forEach((player) => {
    if (player.id === winnerId) {
      scoreChanges[player.id] = selectedScore + honbaBonus + tableRiichiSticks;
    } else if (player.id === loserId) {
      scoreChanges[player.id] = -(selectedScore + honbaBonus);
    } else {
      scoreChanges[player.id] = 0;
    }
  });

  return scoreChanges;
};

/**
 * 流局時の点数計算
 */
export const calculateDrawScoreChanges = (
  players: Player[],
  tenpaiPlayers: string[],
): ScoreChanges => {
  const scoreChanges: ScoreChanges = {};
  const tenpaiCount = tenpaiPlayers.length;
  const notenCount = 4 - tenpaiCount;

  if (tenpaiCount > 0 && tenpaiCount < 4) {
    // テンパイ料の計算
    const tenpaiBonus = GAME_CONSTANTS.DRAW_BONUS_TOTAL / tenpaiCount;
    const notenPenalty = GAME_CONSTANTS.DRAW_BONUS_TOTAL / notenCount;

    players.forEach((player) => {
      if (tenpaiPlayers.includes(player.id)) {
        scoreChanges[player.id] = Math.floor(tenpaiBonus);
      } else {
        scoreChanges[player.id] = -Math.floor(notenPenalty);
      }
    });
  } else {
    players.forEach((player) => {
      scoreChanges[player.id] = 0;
    });
  }

  return scoreChanges;
};

/**
 * 南4局かどうか判定
 */
export const isSouthFour = (round: number): boolean => {
  return round === GAME_CONSTANTS.SOUTH_FOUR_ROUND;
};

/**
 * ゲーム終了判定
 */
export const shouldEndGame = (players: Player[], round: number): boolean => {
  const hasNegativeScore = players.some((p) => p.score < 0);
  const isAfterSouthFour = round > GAME_CONSTANTS.SOUTH_FOUR_ROUND;

  return hasNegativeScore || isAfterSouthFour;
};
