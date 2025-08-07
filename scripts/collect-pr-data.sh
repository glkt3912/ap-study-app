#!/bin/bash

# =================================================================
# フロントエンド PR データ収集スクリプト - Claude解析用データ生成
# =================================================================

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() { echo -e "${BLUE}ℹ️  $1${NC}" >&2; }
log_success() { echo -e "${GREEN}✅ $1${NC}" >&2; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}" >&2; }
log_error() { echo -e "${RED}❌ $1${NC}" >&2; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 出力先ファイル
OUTPUT_FILE="${1:-pr-analysis.json}"

log_info "フロントエンドPRデータ収集を開始... (出力: $OUTPUT_FILE)"

cd "$PROJECT_ROOT"

# JSON出力開始
echo "{" > "$OUTPUT_FILE"

# 1. 基本情報収集
log_info "基本情報を収集中..."
cat >> "$OUTPUT_FILE" << EOF
  "meta": {
    "timestamp": "$(date -Iseconds)",
    "branch": "$(git rev-parse --abbrev-ref HEAD)",
    "commit": "$(git rev-parse HEAD)",
    "author": "$(git config user.name)",
    "project": "$(basename "$PROJECT_ROOT")",
    "type": "frontend",
    "framework": "Next.js 15 + React 19"
  },
EOF

# 2. Git変更情報収集
log_info "Git変更情報を収集中..."
cat >> "$OUTPUT_FILE" << 'EOF'
  "git": {
EOF

# 変更されたファイル一覧
echo '    "changed_files": [' >> "$OUTPUT_FILE"
git diff --name-only HEAD~1 | while IFS= read -r file; do
    if [ -n "$file" ]; then
        echo "      \"$file\"," >> "$OUTPUT_FILE"
    fi
done
# 最後のカンマを削除
if grep -q ',' "$OUTPUT_FILE"; then
    sed -i '$ s/,$//' "$OUTPUT_FILE"
fi
echo '    ],' >> "$OUTPUT_FILE"

# ファイル別変更統計
echo '    "file_changes": [' >> "$OUTPUT_FILE"
git diff --numstat HEAD~1 | while read additions deletions filename; do
    if [ -n "$filename" ]; then
        cat >> "$OUTPUT_FILE" << EOF
      {
        "file": "$filename",
        "additions": $additions,
        "deletions": $deletions,
        "net_change": $((additions - deletions))
      },
EOF
    fi
done
# 最後のカンマを削除
if grep -q ',' "$OUTPUT_FILE"; then
    sed -i '$ s/,$//' "$OUTPUT_FILE"
fi
echo '    ],' >> "$OUTPUT_FILE"

# コミット履歴
echo '    "commits": [' >> "$OUTPUT_FILE"
git log --oneline -10 --format='{"hash": "%H", "short_hash": "%h", "message": "%s", "author": "%an", "date": "%ai"}' | sed 's/$/,/' >> "$OUTPUT_FILE"
# 最後のカンマを削除
if grep -q ',' "$OUTPUT_FILE"; then
    sed -i '$ s/,$//' "$OUTPUT_FILE"
fi
echo '    ],' >> "$OUTPUT_FILE"

# 変更差分サマリー
total_additions=$(git diff --numstat HEAD~1 | awk '{sum+=$1} END {print sum+0}')
total_deletions=$(git diff --numstat HEAD~1 | awk '{sum+=$2} END {print sum+0}')
changed_files_count=$(git diff --name-only HEAD~1 | wc -l)

cat >> "$OUTPUT_FILE" << EOF
    "stats": {
      "total_additions": $total_additions,
      "total_deletions": $total_deletions,
      "net_change": $((total_additions - total_deletions)),
      "changed_files_count": $changed_files_count
    }
  },
EOF

# 3. 品質チェック結果収集
log_info "品質チェック結果を収集中..."
cat >> "$OUTPUT_FILE" << 'EOF'
  "quality_checks": {
EOF

# Next.js ビルドチェック
echo '    "build": {' >> "$OUTPUT_FILE"
if npm run build > /tmp/nextjs-build.log 2>&1; then
    echo '      "success": true,' >> "$OUTPUT_FILE"
    echo '      "message": "Next.js build successful"' >> "$OUTPUT_FILE"
else
    echo '      "success": false,' >> "$OUTPUT_FILE"
    build_error=$(head -10 /tmp/nextjs-build.log | sed 's/"/\\"/g' | tr '\n' ' ')
    echo "      \"message\": \"Next.js build failed: $build_error\"" >> "$OUTPUT_FILE"
fi
echo '    },' >> "$OUTPUT_FILE"

# ESLint チェック
echo '    "lint": {' >> "$OUTPUT_FILE"
if npm run lint > /tmp/nextjs-lint.log 2>&1; then
    echo '      "success": true,' >> "$OUTPUT_FILE"
    echo '      "warnings": 0,' >> "$OUTPUT_FILE"
    echo '      "errors": 0' >> "$OUTPUT_FILE"
else
    lint_warnings=$(grep -c "warning" /tmp/nextjs-lint.log 2>/dev/null || echo "0")
    lint_errors=$(grep -c "error" /tmp/nextjs-lint.log 2>/dev/null || echo "0")
    echo "      \"success\": false," >> "$OUTPUT_FILE"
    echo "      \"warnings\": $lint_warnings," >> "$OUTPUT_FILE"
    echo "      \"errors\": $lint_errors" >> "$OUTPUT_FILE"
fi
echo '    },' >> "$OUTPUT_FILE"

# TypeScript チェック
echo '    "typescript": {' >> "$OUTPUT_FILE"
if npx tsc --noEmit > /tmp/tsc-check.log 2>&1; then
    echo '      "success": true,' >> "$OUTPUT_FILE"
    echo '      "message": "TypeScript check successful"' >> "$OUTPUT_FILE"
else
    tsc_errors=$(grep -c "error" /tmp/tsc-check.log 2>/dev/null || echo "0")
    echo '      "success": false,' >> "$OUTPUT_FILE"
    echo "      \"errors\": $tsc_errors" >> "$OUTPUT_FILE"
fi
echo '    },' >> "$OUTPUT_FILE"

# Test実行結果
echo '    "tests": {' >> "$OUTPUT_FILE"
if npm run test:run > /tmp/test.log 2>&1; then
    echo '      "success": true,' >> "$OUTPUT_FILE"
    test_passed=$(grep -o "[0-9]* passed" /tmp/test.log | head -1 | grep -o "[0-9]*" || echo "0")
    echo "      \"passed\": $test_passed," >> "$OUTPUT_FILE"
    echo '      "failed": 0' >> "$OUTPUT_FILE"
else
    test_failed=$(grep -o "[0-9]* failed" /tmp/test.log | head -1 | grep -o "[0-9]*" || echo "1")
    test_passed=$(grep -o "[0-9]* passed" /tmp/test.log | head -1 | grep -o "[0-9]*" || echo "0")
    echo '      "success": false,' >> "$OUTPUT_FILE"
    echo "      \"passed\": $test_passed," >> "$OUTPUT_FILE"
    echo "      \"failed\": $test_failed" >> "$OUTPUT_FILE"
fi
echo '    }' >> "$OUTPUT_FILE"

echo '  },' >> "$OUTPUT_FILE"

# 4. プロジェクト構造情報
log_info "プロジェクト構造を分析中..."
cat >> "$OUTPUT_FILE" << 'EOF'
  "project_structure": {
EOF

# ファイル統計
tsx_files=$(find src -name "*.tsx" | wc -l)
ts_files=$(find src -name "*.ts" | wc -l)
test_files=$(find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | wc -l)
component_files=$(find src -name "*.tsx" -not -name "*.test.tsx" -not -name "*.spec.tsx" | wc -l)
total_loc=$(find src -name "*.tsx" -o -name "*.ts" -not -name "*.test.*" -not -name "*.spec.*" -exec cat {} \; | wc -l)

cat >> "$OUTPUT_FILE" << EOF
    "tsx_files": $tsx_files,
    "ts_files": $ts_files,
    "component_files": $component_files,
    "test_files": $test_files,
    "total_lines_of_code": $total_loc,
EOF

# 依存関係情報
echo '    "dependencies": {' >> "$OUTPUT_FILE"
prod_deps=$(grep -A 100 '"dependencies"' package.json | grep -c '"[^"]*":' 2>/dev/null || echo "0")
dev_deps=$(grep -A 100 '"devDependencies"' package.json | grep -c '"[^"]*":' 2>/dev/null || echo "0")
echo "      \"production\": $prod_deps," >> "$OUTPUT_FILE"
echo "      \"development\": $dev_deps" >> "$OUTPUT_FILE"
echo '    },' >> "$OUTPUT_FILE"

# Next.js特有情報
echo '    "nextjs": {' >> "$OUTPUT_FILE"
pages_count=$(find src -name "page.tsx" 2>/dev/null | wc -l || echo "0")
layout_count=$(find src -name "layout.tsx" 2>/dev/null | wc -l || echo "0")
middleware_exists=$([ -f "middleware.ts" ] && echo "true" || echo "false")
echo "      \"pages_count\": $pages_count," >> "$OUTPUT_FILE"
echo "      \"layout_count\": $layout_count," >> "$OUTPUT_FILE"
echo "      \"middleware_exists\": $middleware_exists" >> "$OUTPUT_FILE"
echo '    }' >> "$OUTPUT_FILE"

echo '  },' >> "$OUTPUT_FILE"

# 5. ファイル種別分析
log_info "変更ファイル種別を分析中..."
cat >> "$OUTPUT_FILE" << 'EOF'
  "file_analysis": {
    "categories": {
EOF

# ファイルカテゴリ分析
component_files_changed=$(git diff --name-only HEAD~1 | grep -E "\.tsx$" | grep -v test | wc -l || echo "0")
style_files_changed=$(git diff --name-only HEAD~1 | grep -E "\.(css|scss|sass|less)$" | wc -l || echo "0")
config_files_changed=$(git diff --name-only HEAD~1 | grep -E "\.(json|js|ts|yaml|yml)$" | grep -v "src/" | wc -l || echo "0")
test_files_changed=$(git diff --name-only HEAD~1 | grep -E "test|spec" | wc -l || echo "0")
page_files_changed=$(git diff --name-only HEAD~1 | grep "page\.tsx" | wc -l || echo "0")
layout_files_changed=$(git diff --name-only HEAD~1 | grep "layout\.tsx" | wc -l || echo "0")

cat >> "$OUTPUT_FILE" << EOF
      "components": $component_files_changed,
      "pages": $page_files_changed,
      "layouts": $layout_files_changed,
      "styles": $style_files_changed,
      "tests": $test_files_changed,
      "configuration": $config_files_changed
    },
EOF

# 変更の重要度判定
echo '    "change_impact": {' >> "$OUTPUT_FILE"
if [ $component_files_changed -gt 5 ] || [ $total_additions -gt 300 ]; then
    echo '      "level": "major",' >> "$OUTPUT_FILE"
elif [ $component_files_changed -gt 2 ] || [ $total_additions -gt 100 ]; then
    echo '      "level": "moderate",' >> "$OUTPUT_FILE"
else
    echo '      "level": "minor",' >> "$OUTPUT_FILE"
fi

# フロントエンド技術領域の特定
domains=""
if [ $component_files_changed -gt 0 ]; then domains="$domains Components,"; fi
if [ $page_files_changed -gt 0 ]; then domains="$domains Pages,"; fi
if [ $layout_files_changed -gt 0 ]; then domains="$domains Layouts,"; fi
if [ $style_files_changed -gt 0 ]; then domains="$domains Styling,"; fi
if [ $test_files_changed -gt 0 ]; then domains="$domains Testing,"; fi
if git diff --name-only HEAD~1 | grep -q -E "api|lib"; then domains="$domains API,"; fi
if git diff --name-only HEAD~1 | grep -q -E "context|state"; then domains="$domains State Management,"; fi
if git diff --name-only HEAD~1 | grep -q -E "hook|use[A-Z]"; then domains="$domains Hooks,"; fi

# 最後のカンマを削除
domains=$(echo "$domains" | sed 's/,$//')
echo "      \"domains\": \"$domains\"" >> "$OUTPUT_FILE"
echo '    }' >> "$OUTPUT_FILE"

echo '  },' >> "$OUTPUT_FILE"

# 6. パフォーマンス指標
log_info "パフォーマンス指標を収集中..."
cat >> "$OUTPUT_FILE" << 'EOF'
  "performance": {
EOF

# ビルドサイズ情報
if [ -d ".next" ]; then
    build_size_kb=$(du -sk .next | cut -f1)
    echo "    \"build_size_kb\": $build_size_kb," >> "$OUTPUT_FILE"
    
    # チャンク数
    js_chunks=$(find .next -name "*.js" | wc -l || echo "0")
    css_chunks=$(find .next -name "*.css" | wc -l || echo "0")
    echo "    \"js_chunks\": $js_chunks," >> "$OUTPUT_FILE"
    echo "    \"css_chunks\": $css_chunks" >> "$OUTPUT_FILE"
else
    echo '    "build_size_kb": 0,' >> "$OUTPUT_FILE"
    echo '    "js_chunks": 0,' >> "$OUTPUT_FILE"
    echo '    "css_chunks": 0' >> "$OUTPUT_FILE"
fi

echo '  }' >> "$OUTPUT_FILE"

# JSON終了
echo "}" >> "$OUTPUT_FILE"

# 一時ファイルクリーンアップ
rm -f /tmp/nextjs-build.log /tmp/nextjs-lint.log /tmp/tsc-check.log /tmp/test.log

log_success "フロントエンドPRデータ収集完了: $OUTPUT_FILE"

# Claude向けの簡潔な使用説明をファイル末尾にコメントとして追加
cat >> "$OUTPUT_FILE" << 'EOF'

# Claude Code向け使用ガイド（フロントエンド版）:
# 1. このJSONファイルを読み込み、Next.js + React プロジェクトの文脈を理解
# 2. フロントエンド特有の変更内容（コンポーネント、ページ、スタイル）を分析
# 3. UI/UX、パフォーマンス、アクセシビリティの観点でPR文書を生成
# 4. レビューポイントにフロントエンド品質チェック結果を統合した内容を作成
EOF

log_info "Claude Code解析の準備が完了しました（フロントエンド版）"