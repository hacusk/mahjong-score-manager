import type { ScoreOption } from '../../constants/game';
import { GRID_LAYOUTS } from '../../constants/ui';

interface ScoreSelectorProps {
  scoreOptions: readonly ScoreOption[];
  selectedScore: number;
  onScoreChange: (score: number) => void;
  winType: 'tsumo' | 'ron' | 'draw';
  isDealer?: boolean;
}

export function ScoreSelector({ scoreOptions, selectedScore, onScoreChange, winType, isDealer = false }: ScoreSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        点数を選択 {isDealer ? '（親）' : '（子）'}
      </label>
      <div className={GRID_LAYOUTS.SCORE_OPTIONS}>
        {scoreOptions.map((score) => (
          <button
            key={score.value}
            type="button"
            onClick={() => onScoreChange(score.value)}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              selectedScore === score.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <div className="font-bold text-sm">{score.label}</div>
            <div className="text-xs mt-1 opacity-70">
              {score.desc}
            </div>
            {winType === 'tsumo' && (
              <div className="text-xs mt-1 opacity-80 border-t border-current pt-1">
                {score.tsumo}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}