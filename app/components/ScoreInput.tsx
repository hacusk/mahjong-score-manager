import { useState, useEffect } from 'react';
import { GAME_CONSTANTS, SCORE_TABLES } from '../constants/game';
import type { Player, ScoreChanges } from '../types/game';
import type { WinType } from '../constants/game';
import { 
  getTsumoPayments, 
  calculateTsumoScoreChanges, 
  calculateRonScoreChanges, 
  calculateDrawScoreChanges 
} from '../utils/gameHelpers';
import { WinTypeSelector, PlayerSelector, TenpaiSelector, ScoreSelector } from './score-input';
import { Card, Button } from './ui';
import { LABELS, GAME_DESCRIPTIONS } from '../constants/text';

interface ScoreInputProps {
  players: Player[];
  dealerWins: number;
  riichiSticks: number;
  carryOverRiichiSticks: number;
  gamePhase: 'playing' | 'scored' | 'between_rounds';
  gameEnded: boolean;
  onScoreUpdate: (scoreChanges: ScoreChanges, description: string, dealerWon: boolean, wasDraw?: boolean, winnerId?: string, loserId?: string, winType?: 'tsumo' | 'ron' | 'draw') => void;
  onNextRound: () => void;
  onAddRiichiStick: () => void;
  onClearRiichiSticks: () => void;
  onDeclareRiichi: (playerId: string) => void;
}


export function ScoreInput({
  players,
  dealerWins,
  riichiSticks,
  carryOverRiichiSticks,
  gamePhase,
  gameEnded,
  onScoreUpdate,
  onNextRound,
  onAddRiichiStick,
  onClearRiichiSticks,
  onDeclareRiichi,
}: ScoreInputProps) {
  const [winType, setWinType] = useState<WinType>('tsumo');
  const [winnerId, setWinnerId] = useState<string>(players[0].id);
  const [loserId, setLoserId] = useState<string>(players[1].id);
  const [selectedScore, setSelectedScore] = useState<number>(8000);
  const [tenpaiPlayers, setTenpaiPlayers] = useState<string[]>([]);
  
  // リーチ中のプレイヤーは自動的に聴牌に含める
  const riichiPlayerIds = players.filter(p => p.isRiichi).map(p => p.id);
  const effectiveTenpaiPlayers = [...new Set([...tenpaiPlayers, ...riichiPlayerIds])];
  
  const dealer = players.find(p => p.isDealer);
  const isWinnerDealer = winnerId === dealer?.id;
  
  useEffect(() => {
    // 和了者が変わったときに適切なデフォルト点数を設定
    setSelectedScore(isWinnerDealer ? 12000 : 8000);
  }, [isWinnerDealer]);

  useEffect(() => {
    // 和了者が変更されたとき、放銃者が和了者と同じ場合は別のプレイヤーに変更
    if (winType === 'ron' && loserId === winnerId) {
      const availableLosers = players.filter(p => p.id !== winnerId);
      if (availableLosers.length > 0) {
        setLoserId(availableLosers[0].id);
      }
    }
  }, [winnerId, winType, loserId, players]);




  const handleSubmit = () => {
    let scoreChanges: ScoreChanges = {};
    let description = '';
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);
    
    if (winType === 'tsumo') {
      scoreChanges = calculateTsumoScoreChanges(
        players,
        winnerId,
        selectedScore,
        dealerWins,
        riichiSticks,
        carryOverRiichiSticks
      );
      const { dealerPay, childPay } = getTsumoPayments(selectedScore, isWinnerDealer);
      if (isWinnerDealer) {
        description = `${winner?.name}がツモ (子${childPay}オール)`;
      } else {
        description = `${winner?.name}がツモ (子${childPay}/親${dealerPay})`;
      }
    } else if (winType === 'ron') {
      scoreChanges = calculateRonScoreChanges(
        players,
        winnerId,
        loserId,
        selectedScore,
        dealerWins,
        riichiSticks,
        carryOverRiichiSticks
      );
      description = `${winner?.name}が${loser?.name}からロン (${selectedScore}点)`;
    } else {
      // 流局の場合
      scoreChanges = calculateDrawScoreChanges(players, effectiveTenpaiPlayers);
      const tenpaiCount = effectiveTenpaiPlayers.length;
      
      if (tenpaiCount > 0 && tenpaiCount < 4) {
        description = `流局 (聴牌: ${effectiveTenpaiPlayers.map(id => players.find(p => p.id === id)?.name).join(', ')})`;
      } else {
        description = tenpaiCount === 4 ? '流局 (全員聴牌)' : '流局 (全員ノーテン)';
      }
    }
    
    if (dealerWins > 0) {
      description += ` ${dealerWins}本場`;
    }
    
    let dealerWon = false;
    if (winType === 'draw') {
      // 流局時は親がテンパイなら連荘
      dealerWon = effectiveTenpaiPlayers.includes(dealer?.id || '');
    } else {
      dealerWon = isWinnerDealer;
    }
    
    onScoreUpdate(scoreChanges, description, dealerWon, winType === 'draw', winnerId, loserId, winType);
    
    setSelectedScore(8000);
    setTenpaiPlayers([]);
  };

  const scoreOptions = isWinnerDealer ? SCORE_TABLES.dealer : SCORE_TABLES.child;

  if (gameEnded) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {LABELS.GAME_ENDED}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          {GAME_DESCRIPTIONS.GAME_END_MESSAGE}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {LABELS.SCORE_INPUT}
      </h2>
      
      <div className="space-y-6">
        <WinTypeSelector 
          winType={winType}
          onWinTypeChange={setWinType}
        />

        {winType === 'draw' && (
          <TenpaiSelector
            players={players}
            tenpaiPlayers={tenpaiPlayers}
            onTenpaiChange={(playerId, isTenpai) => {
              if (isTenpai) {
                setTenpaiPlayers([...tenpaiPlayers, playerId]);
              } else {
                setTenpaiPlayers(tenpaiPlayers.filter(id => id !== playerId));
              }
            }}
            effectiveTenpaiPlayers={effectiveTenpaiPlayers}
          />
        )}

        {winType !== 'draw' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlayerSelector
                players={players}
                selectedPlayerId={winnerId}
                onPlayerChange={setWinnerId}
                label={LABELS.WINNER}
              />

              {winType === 'ron' && (
                <PlayerSelector
                  players={players}
                  selectedPlayerId={loserId}
                  onPlayerChange={setLoserId}
                  label={LABELS.LOSER}
                  excludePlayerId={winnerId}
                />
              )}
            </div>

            <ScoreSelector
              scoreOptions={scoreOptions}
              selectedScore={selectedScore}
              onScoreChange={setSelectedScore}
              winType={winType}
              isDealer={isWinnerDealer}
            />

          </>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {gamePhase === 'playing' ? (
            <Button 
              onClick={handleSubmit}
              variant="success"
              fullWidth
            >
              {LABELS.CONFIRM}
            </Button>
          ) : (
            <Button 
              onClick={onNextRound}
              variant="primary"
              fullWidth
            >
              {LABELS.NEXT_ROUND}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}