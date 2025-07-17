import type { Wind } from "../../constants/game";
import { DIMENSIONS, TEXT_SIZES, WIND_COLORS } from "../../constants/ui";

interface WindIndicatorProps {
  wind: Wind;
  size?: "small" | "normal";
}

export function WindIndicator({ wind, size = "normal" }: WindIndicatorProps) {
  const sizeClasses =
    size === "small"
      ? "w-8 h-8 text-sm"
      : `${DIMENSIONS.WIND_INDICATOR_SIZE} ${TEXT_SIZES.WIND}`;

  return (
    <span
      className={`
      inline-flex items-center justify-center rounded-full font-bold
      ${WIND_COLORS[wind]}
      ${sizeClasses}
    `}
    >
      {wind}
    </span>
  );
}
