import { SCORE_THRESHOLDS, SCORE_COLORS, TEXT_SIZES } from '../../constants/ui';

interface ScoreDisplayProps {
  score: number;
  showChange?: boolean;
  change?: number;
  size?: 'small' | 'normal' | 'large';
}

export function ScoreDisplay({ score, showChange = false, change = 0, size = 'normal' }: ScoreDisplayProps) {
  const getScoreColor = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return SCORE_COLORS.EXCELLENT;
    if (score >= SCORE_THRESHOLDS.GOOD) return SCORE_COLORS.GOOD;
    if (score >= SCORE_THRESHOLDS.WARNING) return SCORE_COLORS.WARNING;
    return SCORE_COLORS.DANGER;
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return SCORE_COLORS.EXCELLENT;
    if (change < 0) return SCORE_COLORS.DANGER;
    return SCORE_COLORS.GOOD;
  };

  const getSizeClass = (size: string): string => {
    switch (size) {
      case 'small': return 'text-lg font-medium';
      case 'large': return 'text-4xl font-bold';
      default: return TEXT_SIZES.SCORE_MAIN;
    }
  };

  return (
    <div className="text-center">
      <div className={`${getSizeClass(size)} ${getScoreColor(score)}`}>
        {score.toLocaleString()}
      </div>
      {showChange && (
        <div className={`${TEXT_SIZES.SCORE_DIFF} ${getChangeColor(change)} mt-1`}>
          {change > 0 && '+'}{change.toLocaleString()}
        </div>
      )}
    </div>
  );
}