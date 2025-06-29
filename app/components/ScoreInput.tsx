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

interface ScoreInputProps {
  players: Player[];
  dealerWins: number;
  riichiSticks: number;
  carryOverRiichiSticks: number;
  gamePhase: 'playing' | 'scored' | 'between_rounds';
  gameEnded: boolean;
  onScoreUpdate: (scoreChanges: ScoreChanges, description: string, dealerWon: boolean, wasDraw?: boolean) => void;
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
    
    onScoreUpdate(scoreChanges, description, dealerWon, winType === 'draw');
    
    setSelectedScore(8000);
    setTenpaiPlayers([]);
  };

  const scoreOptions = isWinnerDealer ? SCORE_TABLES.dealer : SCORE_TABLES.child;

  if (gameEnded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          ゲーム終了
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          麻雀ゲームが終了しました。<br />
          新しいゲームを開始するには「新規ゲーム」ボタンを押してください。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        点数入力
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            結果
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setWinType('tsumo')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                winType === 'tsumo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              ツモ
            </button>
            <button
              onClick={() => setWinType('ron')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                winType === 'ron'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              ロン
            </button>
            <button
              onClick={() => setWinType('draw')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                winType === 'draw'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              流局
            </button>
          </div>
        </div>

        {winType === 'draw' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              聴牌者を選択
            </label>
            <div className="grid grid-cols-2 gap-2">
              {players.map(player => (
                <label key={player.id} className={`flex items-center gap-2 ${player.isRiichi ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={effectiveTenpaiPlayers.includes(player.id)}
                    disabled={player.isRiichi}
                    onChange={(e) => {
                      if (!player.isRiichi) {
                        if (e.target.checked) {
                          setTenpaiPlayers([...tenpaiPlayers, player.id]);
                        } else {
                          setTenpaiPlayers(tenpaiPlayers.filter(id => id !== player.id));
                        }
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {player.name} ({player.wind})
                    {player.isRiichi && <span className="text-red-600 text-xs ml-1">(リーチ中)</span>}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              リーチ中のプレイヤーは自動的に聴牌になります
            </p>
          </div>
        )}

        {winType !== 'draw' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  和了者
                </label>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.wind})
                    </option>
                  ))}
                </select>
              </div>

              {winType === 'ron' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    放銃者
                  </label>
                  <select
                    value={loserId}
                    onChange={(e) => setLoserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {players
                      .filter(p => p.id !== winnerId)
                      .map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.wind})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                点数選択 {isWinnerDealer ? '（親）' : '（子）'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-3 max-h-96 overflow-y-auto">
                {scoreOptions.map(score => (
                  <button
                    key={score.value}
                    onClick={() => setSelectedScore(score.value)}
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

          </>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {gamePhase === 'playing' ? (
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              確定
            </button>
          ) : (
            <button
              onClick={onNextRound}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              次局へ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}