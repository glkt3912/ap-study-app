#!/bin/bash

# =================================================================
# フロントエンドUI品質チェックスクリプト
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

log_info "フロントエンドUI品質チェックを開始..."

cd "$PROJECT_ROOT"

# 1. アクセシビリティチェック
log_info "1. アクセシビリティチェック実行中..."

# ARIA属性の適切な使用
aria_patterns=(
    'aria-label='           # ラベル付け
    'aria-describedby='     # 説明関連付け
    'role='                 # ロール定義
    'aria-hidden='          # 非表示要素
    'aria-expanded='        # 展開状態
    'aria-current='         # 現在状態
    'tabIndex='            # タブインデックス
)

accessibility_score=0
total_aria_checks=${#aria_patterns[@]}

for pattern in "${aria_patterns[@]}"; do
    if grep -r -q "$pattern" src/ 2>/dev/null; then
        accessibility_score=$((accessibility_score + 1))
    fi
done

aria_usage_percent=$(echo "scale=2; $accessibility_score * 100 / $total_aria_checks" | bc -l 2>/dev/null || echo "0")
log_info "ARIA属性使用率: ${aria_usage_percent}% ($accessibility_score/$total_aria_checks)"

if (( $(echo "$aria_usage_percent > 50" | bc -l 2>/dev/null || echo 0) )); then
    log_success "アクセシビリティ: ARIA属性が適切に使用されています"
else
    log_warning "アクセシビリティ: ARIA属性の使用を増やすことを推奨します"
fi

# セマンティックHTML要素の使用
semantic_elements=(
    '<header>'
    '<nav>'
    '<main>'
    '<section>'
    '<article>'
    '<aside>'
    '<footer>'
    '<h[1-6]>'
)

semantic_score=0
for element in "${semantic_elements[@]}"; do
    if grep -r -q "$element" src/ 2>/dev/null; then
        semantic_score=$((semantic_score + 1))
    fi
done

log_info "セマンティック要素使用: $semantic_score/${#semantic_elements[@]}種類"

if [ "$semantic_score" -gt 4 ]; then
    log_success "セマンティックHTML: 適切に使用されています"
else
    log_warning "セマンティックHTML: より多くのセマンティック要素の使用を推奨します"
fi

# 2. レスポンシブデザインチェック
log_info "2. レスポンシブデザインチェック実行中..."

# CSS-in-JS またはTailwind CSS の使用確認
responsive_patterns=(
    'sm:'               # Tailwind small breakpoint
    'md:'               # Tailwind medium breakpoint
    'lg:'               # Tailwind large breakpoint
    'xl:'               # Tailwind extra large breakpoint
    '@media'            # CSS media queries
    'useMediaQuery'     # React hook
    'breakpoints'       # テーマブレークポイント
)

responsive_score=0
for pattern in "${responsive_patterns[@]}"; do
    if grep -r -q "$pattern" src/ 2>/dev/null; then
        responsive_score=$((responsive_score + 1))
    fi
done

log_info "レスポンシブ対応パターン: $responsive_score/${#responsive_patterns[@]}種類"

if [ "$responsive_score" -gt 3 ]; then
    log_success "レスポンシブデザイン: 適切に実装されています"
else
    log_warning "レスポンシブデザイン: より多くのブレークポイントの対応を推奨します"
fi

# viewport メタタグの確認
if grep -r -q 'viewport.*width=device-width' src/ 2>/dev/null; then
    log_success "Viewport設定: モバイル対応viewport設定があります"
else
    log_warning "Viewport設定: モバイル対応viewport設定を確認してください"
fi

# 3. コンポーネント品質分析
log_info "3. コンポーネント品質分析実行中..."

# コンポーネントファイル数とディレクトリ構造
if [ -d "src/components" ]; then
    component_files=$(find src/components -name "*.tsx" -o -name "*.jsx" | wc -l)
    component_dirs=$(find src/components -type d | wc -l)
    
    log_info "コンポーネント数: $component_files個, ディレクトリ数: $component_dirs個"
    
    # 大きなコンポーネントファイルの検出
    large_components=$(find src/components -name "*.tsx" -o -name "*.jsx" | xargs wc -l | awk '$1 > 300 {print $2 ": " $1 " lines"}' | head -5)
    
    if [ -n "$large_components" ]; then
        log_warning "大きなコンポーネントが見つかりました (>300行):"
        echo "$large_components" | while read line; do
            if [ -n "$line" ]; then
                log_warning "  - $line"
            fi
        done
    else
        log_success "コンポーネントサイズ: 適切です (<300行)"
    fi
    
    # Propsの型定義チェック
    if grep -r -q "interface.*Props\|type.*Props" src/components/ 2>/dev/null; then
        log_success "Props型定義: TypeScript Props型が使用されています"
    else
        log_warning "Props型定義: Props型定義の使用を推奨します"
    fi
else
    log_warning "コンポーネントディレクトリ: src/components が見つかりません"
fi

# 4. パフォーマンス最適化パターンチェック
log_info "4. パフォーマンス最適化パターンチェック実行中..."

# React最適化hooks の使用
optimization_patterns=(
    'useMemo'           # メモ化
    'useCallback'       # 関数メモ化
    'React.memo'        # コンポーネントメモ化
    'lazy('             # 遅延読み込み
    'Suspense'          # Suspense境界
    'dynamic('          # Next.js dynamic import
)

optimization_score=0
for pattern in "${optimization_patterns[@]}"; do
    if grep -r -q "$pattern" src/ 2>/dev/null; then
        optimization_score=$((optimization_score + 1))
    fi
done

log_info "最適化パターン使用: $optimization_score/${#optimization_patterns[@]}種類"

if [ "$optimization_score" -gt 3 ]; then
    log_success "パフォーマンス最適化: 適切に実装されています"
else
    log_warning "パフォーマンス最適化: より多くの最適化パターンの使用を推奨します"
fi

# 5. エラーハンドリング品質
log_info "5. エラーハンドリング品質チェック実行中..."

# エラー境界の使用
if grep -r -q "ErrorBoundary\|componentDidCatch\|getDerivedStateFromError" src/ 2>/dev/null; then
    log_success "エラーハンドリング: Error Boundaryが実装されています"
else
    log_warning "エラーハンドリング: Error Boundaryの実装を推奨します"
fi

# try-catch の使用
trycatch_count=$(grep -r -c "try.*{" src/ 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
log_info "try-catch使用箇所: $trycatch_count箇所"

if [ "$trycatch_count" -gt 5 ]; then
    log_success "エラーハンドリング: 適切にtry-catchが使用されています"
else
    log_warning "エラーハンドリング: 非同期処理のエラーハンドリングを強化してください"
fi

# 6. テストカバレッジチェック
log_info "6. テストカバレッジチェック実行中..."

# テストファイル数の確認
test_files=$(find src -name "*.test.tsx" -o -name "*.test.ts" -o -name "*.spec.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l)
component_files_for_test=$(find src -name "*.tsx" -not -name "*.test.tsx" -not -name "*.spec.tsx" 2>/dev/null | wc -l)

if [ "$component_files_for_test" -gt 0 ]; then
    test_coverage_ratio=$(echo "scale=2; $test_files * 100 / $component_files_for_test" | bc -l 2>/dev/null || echo "0")
    log_info "テストファイル比率: ${test_coverage_ratio}% ($test_files/$component_files_for_test)"
    
    if (( $(echo "$test_coverage_ratio > 30" | bc -l 2>/dev/null || echo 0) )); then
        log_success "テストカバレッジ: 良好です (>30%)"
    else
        log_warning "テストカバレッジ: テストの追加を推奨します (<30%)"
    fi
else
    log_info "コンポーネントファイルが見つかりませんでした"
fi

# 7. 国際化（i18n）対応チェック
log_info "7. 国際化対応チェック実行中..."

i18n_patterns=(
    'useTranslation'     # react-i18next
    't('                 # 翻訳関数
    'next-i18next'       # Next.js i18n
    'locale'             # ロケール設定
    'lang='             # 言語属性
)

i18n_score=0
for pattern in "${i18n_patterns[@]}"; do
    if grep -r -q "$pattern" src/ 2>/dev/null; then
        i18n_score=$((i18n_score + 1))
    fi
done

if [ "$i18n_score" -gt 2 ]; then
    log_success "国際化: i18n対応が実装されています"
else
    log_info "国際化: 将来的にi18n対応を検討してください"
fi

# 8. UIライブラリ使用パターン分析
log_info "8. UIライブラリ使用パターン分析実行中..."

# 一般的なUIライブラリの確認
ui_libraries=(
    "material-ui"
    "ant-design"
    "chakra-ui"
    "react-bootstrap"
    "tailwindcss"
    "styled-components"
    "emotion"
)

used_libraries=()
for lib in "${ui_libraries[@]}"; do
    if grep -q "$lib" package.json 2>/dev/null; then
        used_libraries+=("$lib")
    fi
done

if [ ${#used_libraries[@]} -gt 0 ]; then
    log_info "UIライブラリ: ${used_libraries[*]}"
    
    if [ ${#used_libraries[@]} -gt 2 ]; then
        log_warning "UIライブラリ: 複数のUIライブラリ使用 (バンドルサイズに注意)"
    else
        log_success "UIライブラリ: 適切な選択です"
    fi
else
    log_info "UIライブラリ: カスタムUIを使用中"
fi

# 9. フォーム品質チェック
log_info "9. フォーム品質チェック実行中..."

# フォーム関連パターン
form_patterns=(
    'useForm'           # React Hook Form
    'Formik'            # Formik
    'onSubmit'          # フォーム送信
    'onChange'          # 値変更
    'validation'        # バリデーション
    'required'          # 必須項目
    'error'             # エラー表示
)

form_score=0
for pattern in "${form_patterns[@]}"; do
    if grep -r -q "$pattern" src/ 2>/dev/null; then
        form_score=$((form_score + 1))
    fi
done

if [ "$form_score" -gt 4 ]; then
    log_success "フォーム実装: 適切に実装されています"
else
    log_info "フォーム実装: バリデーションとエラーハンドリングを強化してください"
fi

log_success "フロントエンドUI品質チェック完了！"