#!/bin/bash

# =================================================================
# フロントエンド統合品質チェックスクリプト
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

# 実行モード（all, security, performance, ui, critical）
MODE=${1:-"all"}

log_info "🚀 フロントエンド品質チェック統合実行開始 (モード: $MODE)"

cd "$PROJECT_ROOT"

# チェック結果を格納
RESULTS=()
ERRORS=0
WARNINGS=0

# チェック関数
run_check() {
    local name=$1
    local script=$2
    local required=${3:-false}
    
    if [ -f "$script" ]; then
        log_info "実行中: $name"
        if bash "$script"; then
            log_success "$name: 完了"
            RESULTS+=("✅ $name: 合格")
        else
            if [ "$required" = true ]; then
                log_error "$name: エラー (必須チェック)"
                RESULTS+=("❌ $name: エラー")
                ERRORS=$((ERRORS + 1))
            else
                log_warning "$name: 警告"
                RESULTS+=("⚠️  $name: 警告")
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    else
        log_warning "$name: スクリプトが見つかりません ($script)"
        RESULTS+=("⚠️  $name: スキップ")
        WARNINGS=$((WARNINGS + 1))
    fi
    
    echo "" # 空行
}

# 基本チェック関数（Next.js標準）
run_basic_check() {
    local name=$1
    local command=$2
    local required=${3:-false}
    
    log_info "実行中: $name"
    if eval "$command" > /dev/null 2>&1; then
        log_success "$name: 完了"
        RESULTS+=("✅ $name: 合格")
    else
        if [ "$required" = true ]; then
            log_error "$name: エラー (必須チェック)"
            RESULTS+=("❌ $name: エラー")
            ERRORS=$((ERRORS + 1))
        else
            log_warning "$name: 警告"
            RESULTS+=("⚠️  $name: 警告")
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    echo "" # 空行
}

# モード別実行
case "$MODE" in
    "all")
        log_info "🔄 全チェックを実行します"
        
        # 基本チェック（必須）
        run_basic_check "Next.jsビルドテスト" "npm run build" true
        run_basic_check "ESLintチェック" "npm run lint" true
        run_basic_check "TypeScriptタイプチェック" "npx tsc --noEmit" true
        
        # 専用チェック
        run_check "セキュリティチェック" "./scripts/frontend-security-check.sh" false
        run_check "パフォーマンステスト" "./scripts/frontend-performance-test.sh" false
        run_check "UI品質チェック" "./scripts/frontend-ui-quality-check.sh" false
        
        # テスト実行
        run_basic_check "単体テスト" "npm run test:run" false
        ;;
        
    "critical")
        log_info "🔄 必須チェックのみ実行します"
        run_basic_check "Next.jsビルドテスト" "npm run build" true
        run_basic_check "ESLintチェック" "npm run lint" true
        run_basic_check "TypeScriptタイプチェック" "npx tsc --noEmit" true
        run_check "セキュリティチェック" "./scripts/frontend-security-check.sh" true
        ;;
        
    "security")
        run_check "セキュリティチェック" "./scripts/frontend-security-check.sh" true
        ;;
        
    "performance")
        run_check "パフォーマンステスト" "./scripts/frontend-performance-test.sh" false
        ;;
        
    "ui")
        run_check "UI品質チェック" "./scripts/frontend-ui-quality-check.sh" false
        ;;
        
    "build")
        run_basic_check "Next.jsビルドテスト" "npm run build" true
        run_basic_check "TypeScriptタイプチェック" "npx tsc --noEmit" true
        ;;
        
    *)
        log_error "無効なモード: $MODE"
        echo "使用可能なモード: all, critical, security, performance, ui, build"
        exit 1
        ;;
esac

# 結果サマリー
echo "=============================================="
echo "🎯 フロントエンド品質チェック結果サマリー"
echo "=============================================="

for result in "${RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo "📊 統計:"
echo "  - 総チェック数: ${#RESULTS[@]}"
echo "  - エラー数: $ERRORS"
echo "  - 警告数: $WARNINGS"
echo "  - 成功数: $((${#RESULTS[@]} - ERRORS - WARNINGS))"

# 終了コード決定
if [ "$ERRORS" -gt 0 ]; then
    echo ""
    log_error "❌ 必須チェックでエラーが発生しました。修正してからPRを作成してください。"
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo ""
    log_warning "⚠️  警告がありますが、PRの作成は可能です。可能であれば修正を検討してください。"
    exit 0
else
    echo ""
    log_success "🎉 全てのチェックが合格しました！PRの準備が整いました。"
    exit 0
fi