import { LABELS } from "../../constants/text";
import { Button } from "../ui";

interface WinTypeSelectorProps {
  winType: "tsumo" | "ron" | "draw";
  onWinTypeChange: (winType: "tsumo" | "ron" | "draw") => void;
}

export function WinTypeSelector({
  winType,
  onWinTypeChange,
}: WinTypeSelectorProps) {
  const getButtonVariant = (buttonType: string) => {
    return winType === buttonType ? "primary" : "secondary";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {LABELS.RESULT}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={getButtonVariant("tsumo")}
          onClick={() => onWinTypeChange("tsumo")}
        >
          {LABELS.TSUMO}
        </Button>
        <Button
          variant={getButtonVariant("ron")}
          onClick={() => onWinTypeChange("ron")}
        >
          {LABELS.RON}
        </Button>
        <Button
          variant={getButtonVariant("draw")}
          onClick={() => onWinTypeChange("draw")}
        >
          {LABELS.DRAW}
        </Button>
      </div>
    </div>
  );
}
