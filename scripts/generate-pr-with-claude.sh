#!/bin/bash

# =================================================================
# フロントエンド Claude主導PR生成スクリプト
# =================================================================

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 引数処理
PR_THEME="${1:-"フロントエンド機能改善"}"
OUTPUT_MODE="${2:-"interactive"}"  # interactive | auto | dry-run

log_info "🤖 フロントエンドClaude主導PR生成システム開始"
log_info "テーマ: $PR_THEME"
log_info "モード: $OUTPUT_MODE"

cd "$PROJECT_ROOT"

# 1. データ収集実行
log_info "📊 フロントエンドPRデータ収集中..."
if ! ./scripts/collect-pr-data.sh /tmp/frontend-pr-analysis.json; then
    log_error "データ収集に失敗しました"
    exit 1
fi

log_success "データ収集完了"

# 2. JSON データの検証
if [ ! -f "/tmp/frontend-pr-analysis.json" ]; then
    log_error "PR分析データファイルが見つかりません"
    exit 1
fi

# 3. Claude Code向けガイダンス生成
log_info "🧠 Claude Code解析ガイダンス準備中..."

# フロントエンド特化のClaude向け解析プロンプトを生成
cat > /tmp/frontend-claude-pr-prompt.md << EOF
# Claude Code フロントエンドPR生成リクエスト

## 🎯 タスク概要
以下のJSON分析データを基に、Next.js + Reactプロジェクトの文脈を理解して高品質なPR文書を生成してください。

## 📋 要求仕様

### PR文書生成内容
1. **PRタイトル** (日本語 + 英語Conventional Commits)
2. **PR説明文** (markdown形式、日本語メイン)
3. **レビューガイド** (フロントエンド特化チェックポイント)
4. **品質チェック結果統合** (Build・Lint・TypeScript・Test結果の解釈)

### 品質基準
- ✅ **自然な日本語**: 機械的でない、読みやすい表現
- ✅ **技術的正確性**: フロントエンド技術背景を理解
- ✅ **適切な粒度**: 変更規模に応じた詳細レベル
- ✅ **実用性**: 実際のコードレビューで活用できる内容

### フロントエンド技術コンテキスト
- **プロジェクト**: 応用情報技術者試験 学習管理システム フロントエンド
- **技術スタック**: Next.js 15, React 19, TypeScript 5.8+, Tailwind CSS
- **アーキテクチャ**: App Router, サーバーコンポーネント対応
- **テスト**: Vitest + Testing Library
- **品質**: ESLint + Prettier + TypeScript厳格モード

## 📊 分析対象データ
\`\`\`json
$(cat /tmp/frontend-pr-analysis.json)
\`\`\`

## 🎨 フロントエンド特化出力フォーマット

### 1. PRタイトル
\`\`\`
日本語タイトル例: "ユーザーダッシュボードUI改善"  
英語コミット例: "feat(ui): enhance user dashboard interface"
\`\`\`

### 2. PR説明文 (markdown)
\`\`\`markdown
## Summary
[変更概要を3-5行で要約]

## 🎨 UI/UX改善内容
### 主な変更点
- [UI変更点1: 具体的なコンポーネント改善]
- [UX変更点2: ユーザビリティ向上]
- [パフォーマンス改善3: レンダリング最適化]

### 技術的詳細  
- **コンポーネント設計**: [再利用性・保守性の考慮]
- **状態管理**: [Context・hooks の使用方針]
- **スタイリング**: [Tailwind CSS・レスポンシブ対応]
- **アクセシビリティ**: [ARIA・セマンティックHTML対応]
- **パフォーマンス**: [遅延読み込み・メモ化等の最適化]

## 📋 品質チェック結果
[Next.js Build・ESLint・TypeScript・Test結果の統合と解釈]

## 🧪 Test plan
- [ ] [コンポーネント単体テスト]
- [ ] [インテグレーションテスト]
- [ ] [E2Eテスト（必要に応じて）]
- [ ] [アクセシビリティテスト]
- [ ] [レスポンシブデザインテスト]

## 🔍 Review focus
### 優先レビューポイント
1. **UI/UXデザイン**: [具体的なデザインチェックポイント]
2. **コンポーネント品質**: [再利用性・保守性・性能]
3. **アクセシビリティ**: [WCAG準拠・キーボード操作]
4. **レスポンシブ**: [各ブレークポイントでの表示確認]
5. **パフォーマンス**: [バンドルサイズ・レンダリング性能]

### フロントエンド固有注意事項
- [Next.js App Router使用時の注意点]
- [React 19 新機能使用時の考慮点]
- [SSR・CSR・SSG の適切な選択]
- [SEO・メタタグ対応確認]

## Breaking changes
[破壊的変更の有無とユーザー影響]
\`\`\`

## 🚀 フロントエンド特化生成指示
上記の分析データとフォーマットに基づいて、Next.js + React プロジェクトで使用できる高品質なPR文書を生成してください。

### 重要な観点
- **ユーザー体験**: エンドユーザーへの価値提供を明確化
- **開発者体験**: 保守性・拡張性・再利用性の考慮
- **パフォーマンス**: Core Web Vitals・バンドルサイズへの影響
- **アクセシビリティ**: インクルーシブデザインの実現
- **レスポンシブ**: マルチデバイス対応の品質

変更内容の意図を理解し、フロントエンド技術背景を考慮した自然で説得力のある文書作成をお願いします。

---
**重要**: スクリプトやテンプレート的な表現ではなく、この特定のフロントエンド変更に対する具体的で実用的な内容を生成してください。
EOF

log_success "Claude Code解析ガイダンス準備完了"

# 4. 実行モード別処理
case "$OUTPUT_MODE" in
    "interactive")
        log_info "🔄 対話的モードで実行します"
        echo ""
        echo "=============================================="
        echo "🤖 フロントエンドClaude Code PR生成 - 対話的モード"
        echo "=============================================="
        echo ""
        echo "📁 以下のファイルが準備されました:"
        echo "  - 分析データ: /tmp/frontend-pr-analysis.json"
        echo "  - 解析ガイド: /tmp/frontend-claude-pr-prompt.md"
        echo ""
        echo "👨‍💻 次の手順でPRを生成してください:"
        echo ""
        echo "1. 以下のコマンドでClaude Codeに解析ガイドを提供:"
        echo "   Claude Code: /tmp/frontend-claude-pr-prompt.md の内容を確認してください"
        echo ""
        echo "2. Claude CodeがフロントエンドPR文書を生成"
        echo ""  
        echo "3. 生成された内容をレビューして調整"
        echo ""
        echo "4. PRを作成:"
        echo "   gh pr create --title \"[生成されたタイトル]\" --body \"[生成された説明文]\""
        echo ""
        ;;
        
    "dry-run")
        log_info "🧪 ドライランモードで実行します"
        echo ""
        echo "=============================================="
        echo "📋 フロントエンドPR生成予定内容 (ドライラン)"
        echo "=============================================="
        echo ""
        echo "📊 収集されたデータ:"
        branch=$(cat /tmp/frontend-pr-analysis.json | grep -o '"branch": "[^"]*"' | cut -d'"' -f4)
        files_count=$(cat /tmp/frontend-pr-analysis.json | grep -o '"changed_files_count": [0-9]*' | grep -o '[0-9]*')
        total_additions=$(cat /tmp/frontend-pr-analysis.json | grep -o '"total_additions": [0-9]*' | grep -o '[0-9]*')
        component_files=$(cat /tmp/frontend-pr-analysis.json | grep -o '"components": [0-9]*' | grep -o '[0-9]*')
        
        echo "  - ブランチ: $branch"
        echo "  - 変更ファイル数: $files_count"
        echo "  - 追加行数: $total_additions"
        echo "  - 変更コンポーネント数: $component_files"
        echo ""
        echo "📝 Claude Code解析用ファイル準備完了:"
        echo "  - /tmp/frontend-pr-analysis.json ($(wc -l < /tmp/frontend-pr-analysis.json)行)"
        echo "  - /tmp/frontend-claude-pr-prompt.md ($(wc -l < /tmp/frontend-claude-pr-prompt.md)行)"
        echo ""
        echo "⚡ 実際の実行には '--mode interactive' または '--mode auto' を使用してください"
        ;;
        
    "auto")
        log_warning "🚧 自動モードは開発中です"
        echo "現在は対話的モード (interactive) のみサポートしています"
        echo "将来のバージョンでClaude API連携による完全自動化を予定"
        ;;
        
    *)
        log_error "無効なモード: $OUTPUT_MODE"
        echo "使用可能なモード: interactive, auto, dry-run"
        exit 1
        ;;
esac

# 5. クリーンアップ設定
if [ "$OUTPUT_MODE" != "interactive" ]; then
    log_info "🧹 一時ファイルをクリーンアップします"
    echo "一時ファイルを保持するには Ctrl+C で中断してください..."
    sleep 3
    rm -f /tmp/frontend-pr-analysis.json /tmp/frontend-claude-pr-prompt.md
    log_success "クリーンアップ完了"
else
    log_info "💾 Claude Code作業用ファイルを保持しています:"
    echo "  - /tmp/frontend-pr-analysis.json"
    echo "  - /tmp/frontend-claude-pr-prompt.md"
    echo ""
    echo "作業完了後は手動でクリーンアップしてください"
fi

log_success "🎉 フロントエンドClaude主導PR生成システム処理完了"