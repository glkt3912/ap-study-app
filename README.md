# 🖥️ 応用情報技術者試験 学習管理アプリ (フロントエンド)

React + Next.js で構築された学習進捗管理のWebアプリケーションです。

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 を開く
```

## 🛠️ 技術スタック

- **Next.js 15** - App Router使用
- **React 19** - 最新のReactフック
- **TypeScript** - 型安全性
- **Tailwind CSS** - レスポンシブデザイン

## 📁 プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # 全体レイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── Dashboard.tsx      # ダッシュボード
│   ├── WeeklyPlan.tsx     # 週間計画
│   ├── StudyLog.tsx       # 学習記録
│   ├── TestRecord.tsx     # 問題演習記録
│   └── Analysis.tsx       # 学習分析
└── data/
    └── studyPlan.ts       # 型定義・初期データ
```

## 🎨 主要コンポーネント

### 📊 Dashboard

学習進捗の全体概要を表示

- 進捗率、総学習時間、平均理解度
- 今日のタスク表示
- 週別進捗グラフ

### 📅 WeeklyPlan

12週間の学習計画管理

- 週別タブ切り替え
- タスクの完了管理
- 学習時間・理解度記録

### ✏️ StudyLog

日々の学習記録

- フォーム入力
- 学習履歴表示
- 統計データ表示

## 🔧 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクション実行
npm run lint         # ESLint実行
```

## 🎯 主要機能

- ✅ レスポンシブデザイン
- ✅ タブベースナビゲーション
- ✅ リアルタイム進捗表示
- ✅ フォームバリデーション
- ✅ データ可視化

## ⚙️ 環境変数設定

### 必須環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | バックエンドAPI URL |
| `NODE_ENV` | `development` | 実行環境 |

### 設定例

**開発環境 (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="応用情報技術者試験 学習管理アプリ"
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**本番環境 (.env.production):**

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="応用情報技術者試験 学習管理アプリ"
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 環境変数設定手順

```bash
# .env.exampleから.env.localをコピー
cp .env.example .env.local

# 必要に応じて設定値を修正
vim .env.local
```

## 🔗 バックエンド連携

APIクライアントによる自動データ取得：

```typescript
// API呼び出し例
const data = await apiClient.getStudyPlan()
// フォールバック: エラー時はモックデータを使用
```

**連携機能:**

- 自動データ取得とフォールバック
- エラーハンドリングとローディング状態
- CORS対応済み
