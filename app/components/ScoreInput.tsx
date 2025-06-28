import { useState, useEffect } from 'react';
import type { Player } from '../hooks/useGameState';

interface ScoreInputProps {
  players: Player[];
  dealerWins: number;
  riichiSticks: number;
  carryOverRiichiSticks: number;
  gamePhase: 'playing' | 'scored' | 'between_rounds';
  gameEnded: boolean;
  onScoreUpdate: (scoreChanges: { [playerId: string]: number }, description: string, dealerWon: boolean, wasDraw?: boolean) => void;
  onNextRound: () => void;
  onAddRiichiStick: () => void;
  onClearRiichiSticks: () => void;
  onDeclareRiichi: (playerId: string) => void;
}

type WinType = 'tsumo' | 'ron' | 'draw';

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

  const getTsumoPayments = (score: number, isDealer: boolean) => {
    // ツモ時の支払い額を返す
    const childPayments: { [key: number]: [number, number] } = {
      // 子の点数 -> [親の支払い, 子の支払い]
      1000: [500, 300],   // 30符1翻
      1300: [700, 400],   // 40符1翻
      1600: [800, 400],   // 50符1翻・七対子
      2000: [1000, 500],  // 30符2翻・60符1翻
      2300: [1200, 600],  // 70符1翻
      2600: [1300, 700],  // 40符2翻
      3200: [1600, 800],  // 50符2翻
      3900: [2000, 1000], // 30符3翻・60符2翻
      4500: [2300, 1200], // 70符2翻
      5200: [2600, 1300], // 40符3翻
      6400: [3200, 1600], // 50符3翻
      7700: [3900, 2000], // 30符4翻・60符3翻
      8000: [4000, 2000], // 満貫
      12000: [6000, 3000], // 跳満
      16000: [8000, 4000], // 倍満
      24000: [12000, 6000], // 三倍満
      32000: [16000, 8000], // 役満
    };
    
    const dealerPayments: { [key: number]: number } = {
      // 親の点数 -> 子の支払い（オール）
      1500: 500,   // 30符1翻
      2000: 700,   // 40符1翻
      2400: 800,   // 50符1翻・七対子
      2900: 1000,  // 30符2翻・60符1翻
      3400: 1200,  // 70符1翻
      3900: 1300,  // 40符2翻
      4800: 1600,  // 50符2翻
      5800: 2000,  // 30符3翻・60符2翻
      6800: 2300,  // 70符2翻
      7700: 2600,  // 40符3翻
      9600: 3200,  // 50符3翻
      11600: 3900, // 30符4翻・60符3翻
      12000: 4000, // 満貫
      18000: 6000, // 跳満
      24000: 8000, // 倍満
      36000: 12000, // 三倍満
      48000: 16000, // 役満
    };
    
    if (isDealer) {
      // 親の場合は子全員が同額を支払う
      return { dealerPay: 0, childPay: dealerPayments[score] || 0 };
    } else {
      // 子の場合は親と他の子で支払い額が異なる
      const [dealerPay, childPay] = childPayments[score] || [0, 0];
      return { dealerPay, childPay };
    }
  };

  const calculateTsumoPayments = () => {
    const scoreChanges: { [playerId: string]: number } = {};
    const honbaBonus = dealerWins * 300;
    const tableRiichiSticks = (riichiSticks + carryOverRiichiSticks) * 1000; // 場に出ているリーチ棒+供託の合計点数
    const { dealerPay, childPay } = getTsumoPayments(selectedScore, isWinnerDealer);
    
    if (isWinnerDealer) {
      // 親のツモ
      const honbaPerPlayer = dealerWins * 100; // 本場数 × 100点
      
      players.forEach(player => {
        if (player.id === winnerId) {
          // 和了者は基本点数 + 本場ボーナス + 場に出ているリーチ棒をすべて取得
          scoreChanges[player.id] = (childPay * 3) + honbaBonus + tableRiichiSticks;
        } else {
          scoreChanges[player.id] = -(childPay + honbaPerPlayer);
        }
      });
    } else {
      // 子のツモ
      const honbaPerPlayer = dealerWins * 100; // 本場数 × 100点
      
      players.forEach(player => {
        if (player.id === winnerId) {
          // 和了者は基本点数 + 本場ボーナス + 場に出ているリーチ棒をすべて取得
          scoreChanges[player.id] = dealerPay + (childPay * 2) + honbaBonus + tableRiichiSticks;
        } else if (player.isDealer) {
          scoreChanges[player.id] = -(dealerPay + honbaPerPlayer);
        } else {
          scoreChanges[player.id] = -(childPay + honbaPerPlayer);
        }
      });
    }
    
    return scoreChanges;
  };

  const calculateRonPayment = () => {
    const scoreChanges: { [playerId: string]: number } = {};
    const honbaBonus = dealerWins * 300;
    const tableRiichiSticks = (riichiSticks + carryOverRiichiSticks) * 1000; // 場に出ているリーチ棒+供託の合計点数
    
    // ロンの場合：放銃者が基本点数+本場ボーナスを支払い、和了者は場のリーチ棒もすべて取得
    players.forEach(player => {
      if (player.id === winnerId) {
        // 和了者は基本点数 + 本場ボーナス + 場に出ているリーチ棒をすべて取得
        scoreChanges[player.id] = selectedScore + honbaBonus + tableRiichiSticks;
      } else if (player.id === loserId) {
        // 放銃者は基本点数 + 本場ボーナスのみ支払い
        scoreChanges[player.id] = -(selectedScore + honbaBonus);
      } else {
        scoreChanges[player.id] = 0;
      }
    });
    
    return scoreChanges;
  };

  const handleSubmit = () => {
    let scoreChanges: { [playerId: string]: number } = {};
    let description = '';
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);
    
    if (winType === 'tsumo') {
      scoreChanges = calculateTsumoPayments();
      description = `${winner?.name}がツモ (${selectedScore}点)`;
    } else if (winType === 'ron') {
      scoreChanges = calculateRonPayment();
      description = `${winner?.name}が${loser?.name}からロン (${selectedScore}点)`;
    } else {
      // 流局の場合
      const tenpaiCount = effectiveTenpaiPlayers.length;
      const notenCount = 4 - tenpaiCount;
      
      if (tenpaiCount > 0 && tenpaiCount < 4) {
        // テンパイ料の計算
        const tenpaiBonus = 3000 / tenpaiCount;
        const notenPenalty = 3000 / notenCount;
        
        players.forEach(player => {
          if (effectiveTenpaiPlayers.includes(player.id)) {
            scoreChanges[player.id] = Math.floor(tenpaiBonus);
          } else {
            scoreChanges[player.id] = -Math.floor(notenPenalty);
          }
        });
        
        description = `流局 (聴牌: ${effectiveTenpaiPlayers.map(id => players.find(p => p.id === id)?.name).join(', ')})`;
      } else {
        players.forEach(player => {
          scoreChanges[player.id] = 0;
        });
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

  const childScores = [
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
  ];
  
  const dealerScores = [
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
  ];
  
  const scoreOptions = isWinnerDealer ? dealerScores : childScores;

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