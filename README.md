# 🖥️ 応用情報技術者試験 学習管理アプリ (フロントエンド)

**Next.js 15 + React 19**で構築された高品質・型安全な学習進捗管理Webアプリケーションです。

## ✨ 特徴

**学習管理** + **診断ツール** + **データ分析** を統合した高品質アプリケーション

## 🚀 クイックスタート

### 🐳 自動環境管理スクリプト（推奨）

重複プロセスを自動停止してクリーンな開発環境を構築：

```bash
# プロジェクトルートから
cd ap-study-project

# Docker環境で起動（推奨）
./dev.sh start docker

# ローカル環境で起動（高速開発）
./dev.sh start local

# ブラウザで http://localhost:3000 を開く
```

### 🔧 従来のDocker環境

```bash
# プロジェクトルートから
cd ap-study-project
docker compose up --build
```

### 💻 個別ローカル環境

```bash
cd ap-study-app

# 依存関係のインストール
npm install

# 環境変数設定
export NEXT_PUBLIC_API_URL="http://localhost:8000"

# 開発サーバー起動
npm run dev
```

## 🛠️ 技術スタック

- **Next.js 15.4.5** - App Router + React Server Components
- **React 19.1.1** - 最新Reactフック + Suspense
- **TypeScript 5.8.3** - 厳格型チェック (strict mode)
- **Tailwind CSS 3.4.6** - ユーティリティファーストCSS
- **Recharts 3.1.0** - データ可視化ライブラリ

### 開発ツール・品質管理

- **ESLint 8.57.1** - 厳格コード品質チェック
- **@typescript-eslint 8.38.0** - TypeScript専用lintルール
- **Node.js 22.17.1** - 厳密バージョン管理
- **PWA対応** - オフラインファーストアプリ

## 📁 プロジェクト構成

```
src/
├── app/                        # Next.js App Router
│   ├── api-test/               # 🔌 API接続テストページ
│   ├── css-test/               # 🎨 CSS専用テストページ
│   ├── debug/                  # 🧑‍🔬 総合診断ページ
│   ├── env-check/              # 🖥️ 環境チェックページ
│   ├── simple/                 # シンプルモードページ
│   ├── test-dark/              # ダークモードテスト
│   ├── globals.css             # グローバルスタイル + ダークモード
│   ├── layout.tsx              # 全体レイアウト + テーマ管理
│   └── page.tsx                # メインダッシュボード
├── components/                 # Reactコンポーネント
│   ├── Analysis.tsx            # 📈 学習分析 + AI予測
│   ├── Dashboard.tsx           # 📊 ダッシュボード
│   ├── DataExport.tsx          # 💾 データエクスポート機能
│   ├── DiagnosticHub.tsx       # 🧑‍🔬 診断ハブ
│   ├── Quiz.tsx                # 🎯 IPA公式過去問演習
│   ├── StudyLog.tsx            # ✏️ 学習記録
│   ├── TestRecord.tsx          # 📝 問題演習記録
│   ├── WeeklyPlan.tsx          # 📅 週間計画
│   ├── charts/
│   │   └── AnalysisCharts.tsx  # 💹 Rechartsチャート統合
│   └── ui/
│       ├── Skeleton.tsx        # ⚙️ ローディングUI
│       └── ThemeToggle.tsx     # 🌙 ダークモードトグル
├── contexts/
│   └── ThemeContext.tsx        # テーマ状態管理
├── data/
│   └── studyPlan.ts            # 型定義・初期データ
└── lib/
    └── api.ts                  # APIクライアント + エラーハンドリング
```

## 🎨 主要コンポーネント

### 📊 Dashboard

**学習進捗総合ダッシュボード**

- 進捗率、総学習時間、平均理解度表示
- 今日のタスク・スケジュール表示
- Rechartsでのリアルタイム進捗グラフ
- ダークモード対応デザイン

### 📅 WeeklyPlan

**12週間体系的学習計画管理**

- 週別タブUI + タスク進捗管理
- リアルタイム学習時間・理解度記録
- レスポンシブデザイン対応

### ✏️ StudyLog

**日々の学習記録・履歴管理**

- フォームバリデーション + リアルタイム保存
- 学習履歴タイムライン表示
- 統計データのチャート可視化

### 🎯 Quiz

**IPA公式過去問演習システム**

- 午前・午後問題の組み合わせ出題
- リアルタイム正解率・解答時間計測
- 解説・解答履歴表示

### 📈 Analysis + AI予測

**学習パターン分析・成績予測**

- 学習時間パターン分析
- AIによる試験合格確率予測
- Rechartsでのデータ可視化
- 改善提案アルゴリズム

### 🧑‍🔬 DiagnosticHub

**総合診断システム**

- CSS/JavaScript/API/環境の包括チェック
- パフォーマンスメトリクス計測
- リアルタイムエラー検出・ログ表示
- 開発効率向上ツール

### 💾 DataExport

**学習データエクスポート**

- JSON/CSV形式での詳細データ出力
- 学習記録・テスト結果・統計情報
- バックアップ・外部ツール連携機能

## 🔧 開発コマンド

```bash
# 基本コマンド
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # コード品質チェック

# 統合環境管理 (プロジェクトルートから)
./dev.sh start local # ローカル環境起動
./dev.sh status      # サービス状態確認
./dev.sh stop        # 全サービス停止
```

## 🎯 主要機能

- **📊 学習管理** - 12週間計画・進捗記録・統計表示
- **🎯 Quiz演習** - IPA公式過去問・リアルタイム採点
- **📈 AI分析** - 学習パターン分析・合格率予測
- **🌙 ダークモード** - 目に優しい学習環境
- **🧑‍🔬 診断ツール** - CSS/API/環境の統合チェック
- **💾 データ出力** - JSON/CSV形式エクスポート
- **📱 PWA対応** - オフライン・高速起動

## ⚙️ 環境変数設定

### 必須環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | バックエンドAPI URL (Hono.js) |
| `NODE_ENV` | `development` | 実行環境 |
| `NEXT_PUBLIC_APP_NAME` | `応用情報技術者試験 学習管理アプリ` | アプリケーション名 |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | アプリケーションバージョン |

### 🔧 設定例

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

**Hono.js APIクライアント** による高速データ通信：

```typescript
// 型安全なAPI呼び出し例
import { apiClient } from '@/lib/api'

// 学習プラン取得 + エラーハンドリング
const { data, error, loading } = await apiClient.getStudyPlan()
if (error) {
  // フォールバック: モックデータ使用
  return mockStudyPlan
}

// POSTリクエスト例 (学習記録保存)
const result = await apiClient.createStudyLog({
  date: '2024-01-01',
  hours: 3,
  understanding: 4
})
```

**連携機能**: 自動エラーハンドリング・フォールバック・リトライ・CORS対応済み

## 🔍 診断ページ

開発効率向上のための専用診断機能:

- `/debug` - 総合診断
- `/css-test` - CSSテスト  
- `/env-check` - 環境チェック
- `/api-test` - API接続テスト
- `/test-dark` - ダークモードテスト
