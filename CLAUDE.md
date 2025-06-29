# Mahjong Calculator - Project Documentation

## Overview
麻雀の点数を記録・表示するWebアプリケーション。物理的な麻雀卓の点数表示機能を代替するために開発。

## Tech Stack
- **Framework**: React Router v7 (SSR対応のReactフレームワーク)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (ダークモード対応)
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Project Structure
```
/
├── app/
│   ├── components/       # UIコンポーネント
│   │   ├── ScoreBoard.tsx    # メインの点数表示ボード
│   │   ├── ScoreInput.tsx    # 点数入力インターフェース
│   │   ├── GameHistory.tsx   # ゲーム履歴表示
│   │   └── PlayerScore.tsx   # 個別プレイヤー表示
│   ├── hooks/           # カスタムフック
│   │   └── useGameState.ts   # ゲーム状態管理
│   ├── types/           # TypeScript型定義
│   │   └── game.ts          # ゲーム関連の型
│   ├── constants/       # 定数定義
│   │   └── scores.ts        # 点数表データ
│   ├── utils/           # ユーティリティ関数
│   │   └── score.ts         # 点数計算ロジック
│   ├── routes.ts        # ルーティング設定
│   └── root.tsx         # ルートコンポーネント
├── react-router.config.ts    # React Router設定
├── tailwind.config.ts        # Tailwind CSS設定
└── vite.config.ts           # Vite設定
```

## Core Features

### 1. 点数管理
- 4人プレイヤーの点数を追跡（初期点数：25,000点）
- 日本の4人麻雀ルールに対応
- localStorageによる状態の永続化

### 2. 得点計算機能
- **ツモ（自摸）**: 全員から点数を徴収
- **ロン**: 放銃者のみから点数を徴収
- **流局**: 聴牌・不聴牌による点数移動

### 3. 高度な機能
- **リーチ宣言**: 1,000点の供託
- **本場（honba）**: 連続親による追加点（1本場につき300点）
- **供託**: 未回収のリーチ棒は次局に持ち越し
- **自動終了判定**: 誰かが0点未満になるか、南4局終了で判定

## Key Components

### ScoreBoard (`/app/components/ScoreBoard.tsx`)
- 全プレイヤーの現在の点数、風、親状態を表示
- 現在の局と本場数を表示
- プレイヤー名の編集と新規ゲーム開始機能

### ScoreInput (`/app/components/ScoreInput.tsx`)
- ゲーム結果の入力インターフェース
- 翻・符による点数早見表を提供
- 親・子それぞれの点数表
- 流局時の聴牌選択

### GameHistory (`/app/components/GameHistory.tsx`)
- 過去の全局の履歴をスクロール可能なリストで表示
- 各プレイヤーの点数変動を表示
- リーチ宣言と局の詳細を表示

### useGameState (`/app/hooks/useGameState.ts`)
- ゲーム全体の状態管理
- localStorageとの同期
- 点数計算ロジックの実装

## Data Models

### Player
```typescript
{
  id: string
  name: string
  score: number
  isDealer: boolean
  wind: "東" | "南" | "西" | "北"
  hasRiichi: boolean
}
```

### GameState
```typescript
{
  players: Player[]
  currentRound: string  // e.g., "東1局"
  honba: number
  riichiSticks: number
  gameHistory: GameRound[]
}
```

## Development Commands
```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# プレビュー
pnpm start

# 型チェック
pnpm typecheck
```

## Game Flow
1. **ゲーム開始**: 各プレイヤー25,000点でスタート
2. **局進行**: 各局終了後に結果を入力
3. **点数計算**: 基本点 + 本場ボーナス + リーチ棒回収
4. **局の移行**: 親の和了/聴牌で連荘、それ以外で親移動
5. **ゲーム終了**: 南4局終了または誰かが0点未満

## Important Notes
- 点数計算は日本の標準的な4人麻雀ルールに準拠
- UIはタッチ操作を考慮したレスポンシブデザイン
- ダークモード対応で長時間の使用でも目に優しい
- リアルタイムでの点数更新により、物理的な点数棒の管理が不要

## Future Enhancements
- [ ] ゲーム履歴のエクスポート機能
- [ ] 統計情報の表示（平均順位、和了率など）
- [ ] カスタムルール設定（初期点数、ウマなど）