import {
  DIMENSIONS,
  RANK_COLORS,
  RANK_EMOJIS,
  TEXT_SIZES,
} from "../../constants/ui";

interface RankBadgeProps {
  rank: number;
  showEmoji?: boolean;
  size?: "small" | "normal";
}

export function RankBadge({
  rank,
  showEmoji = false,
  size = "normal",
}: RankBadgeProps) {
  const validRank = Math.max(1, Math.min(4, rank)) as 1 | 2 | 3 | 4;
  const sizeClasses =
    size === "small"
      ? "w-6 h-6 text-xs"
      : `${DIMENSIONS.RANK_BADGE_SIZE} ${TEXT_SIZES.RANK}`;

  if (showEmoji) {
    return <span className="text-2xl">{RANK_EMOJIS[validRank]}</span>;
  }

  return (
    <span
      className={`
      inline-flex items-center justify-center rounded-full font-bold
      ${RANK_COLORS[validRank]}
      ${sizeClasses}
    `}
    >
      {validRank}
    </span>
  );
}
