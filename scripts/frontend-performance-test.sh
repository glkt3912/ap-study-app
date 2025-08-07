#!/bin/bash

# =================================================================
# フロントエンドパフォーマンステストスクリプト
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

# パフォーマンス閾値設定
MAX_BUNDLE_SIZE_MB=5
MAX_BUILD_TIME_SEC=60
MAX_IMAGE_SIZE_KB=500

log_info "フロントエンドパフォーマンステストを開始..."

cd "$PROJECT_ROOT"

# 1. ビルドサイズ分析
log_info "1. ビルドサイズ分析実行中..."

# Next.jsビルド実行
build_start=$(date +%s)
if npm run build > /tmp/nextjs-build.log 2>&1; then
    build_end=$(date +%s)
    build_time=$((build_end - build_start))
    
    log_success "Next.jsビルド成功: ${build_time}秒"
    
    if [ "$build_time" -gt "$MAX_BUILD_TIME_SEC" ]; then
        log_warning "ビルド時間: ${build_time}秒 (推奨: < ${MAX_BUILD_TIME_SEC}秒)"
    else
        log_success "ビルド時間: 良好です (< ${MAX_BUILD_TIME_SEC}秒)"
    fi
    
    # .nextディレクトリのサイズ分析
    if [ -d ".next" ]; then
        next_size_kb=$(du -sk .next | cut -f1)
        next_size_mb=$(echo "scale=2; $next_size_kb / 1024" | bc -l 2>/dev/null || echo "N/A")
        
        log_info "Next.jsビルド出力サイズ: ${next_size_mb} MB"
        
        if [ "$next_size_mb" != "N/A" ] && (( $(echo "$next_size_mb > $MAX_BUNDLE_SIZE_MB" | bc -l 2>/dev/null || echo 0) )); then
            log_warning "ビルドサイズ: ${next_size_mb} MB (推奨: < ${MAX_BUNDLE_SIZE_MB} MB)"
        else
            log_success "ビルドサイズ: 適切です (< ${MAX_BUNDLE_SIZE_MB} MB)"
        fi
        
        # チャンク別サイズ分析
        if [ -d ".next/static/chunks" ]; then
            log_info "大きなJavaScriptチャンク (上位5個):"
            find .next/static/chunks -name "*.js" -exec ls -lh {} \; | sort -k5 -hr | head -5 | awk '{print "  " $5 " " $9}' || true
        fi
        
        # CSS サイズ分析
        if [ -d ".next/static/css" ]; then
            css_files=$(find .next/static/css -name "*.css" | wc -l)
            if [ "$css_files" -gt 0 ]; then
                css_total_kb=$(find .next/static/css -name "*.css" -exec cat {} \; | wc -c | awk '{print int($1/1024)}')
                log_info "CSSファイル数: $css_files個, 総サイズ: ${css_total_kb} KB"
            fi
        fi
    fi
else
    log_error "Next.jsビルドに失敗しました"
    cat /tmp/nextjs-build.log
    exit 1
fi

# 2. 画像最適化チェック
log_info "2. 画像最適化チェック実行中..."

if [ -d "public" ]; then
    # 大きな画像ファイルの検出
    large_images=$(find public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) -size +${MAX_IMAGE_SIZE_KB}k 2>/dev/null || true)
    
    if [ -n "$large_images" ]; then
        log_warning "大きな画像ファイルが見つかりました (> ${MAX_IMAGE_SIZE_KB}KB):"
        echo "$large_images" | while read file; do
            if [ -n "$file" ]; then
                size_kb=$(du -k "$file" | cut -f1)
                log_warning "  - $file: ${size_kb}KB"
            fi
        done
        log_info "画像最適化ツール (next-optimized-images等) の使用を推奨します"
    else
        log_success "画像サイズ: 適切です (< ${MAX_IMAGE_SIZE_KB}KB)"
    fi
    
    # WebP形式の使用確認
    webp_count=$(find public -name "*.webp" 2>/dev/null | wc -l || echo "0")
    total_images=$(find public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) 2>/dev/null | wc -l || echo "0")
    
    if [ "$total_images" -gt 0 ]; then
        webp_ratio=$(echo "scale=2; $webp_count * 100 / $total_images" | bc -l 2>/dev/null || echo "0")
        log_info "WebP使用率: ${webp_ratio}% ($webp_count/$total_images)"
        
        if (( $(echo "$webp_ratio < 30" | bc -l 2>/dev/null || echo 1) )); then
            log_warning "WebP形式の使用を増やすことを推奨します"
        fi
    fi
else
    log_info "public ディレクトリが見つかりません"
fi

# 3. JavaScript バンドル分析
log_info "3. JavaScript バンドル分析実行中..."

if [ -d ".next" ]; then
    # Next.js バンドル分析
    if [ -f ".next/static/chunks/pages/_app.js" ]; then
        app_size_kb=$(du -k .next/static/chunks/pages/_app.js | cut -f1)
        log_info "_app.js サイズ: ${app_size_kb} KB"
        
        if [ "$app_size_kb" -gt 300 ]; then
            log_warning "_app.js が大きすぎます (${app_size_kb} KB > 300 KB)"
        fi
    fi
    
    # 重複するモジュールの検出
    if command -v npx >/dev/null 2>&1; then
        log_info "バンドル重複分析を実行中..."
        # webpack-bundle-analyzer がある場合のみ実行
        if npm list webpack-bundle-analyzer >/dev/null 2>&1; then
            log_info "webpack-bundle-analyzer が利用可能です"
        else
            log_info "webpack-bundle-analyzer の導入を推奨します: npm install --save-dev webpack-bundle-analyzer"
        fi
    fi
fi

# 4. CSS最適化チェック
log_info "4. CSS最適化チェック実行中..."

# 未使用CSSの検出
css_files=$(find . -name "*.css" -not -path "./node_modules/*" -not -path "./.next/*" 2>/dev/null || true)
css_count=$(echo "$css_files" | grep -c . || echo "0")

if [ "$css_count" -gt 0 ]; then
    log_info "CSSファイル数: $css_count個"
    
    # Tailwind CSS の使用確認
    if grep -q "tailwindcss" package.json 2>/dev/null; then
        log_success "Tailwind CSS: 使用中（効率的なCSS生成）"
        
        # Tailwind purge設定確認
        if [ -f "tailwind.config.js" ] || [ -f "tailwind.config.ts" ]; then
            purge_config=$(find . -name "tailwind.config.*" -exec grep -l "purge\|content" {} \; 2>/dev/null || true)
            if [ -n "$purge_config" ]; then
                log_success "Tailwind purge設定: 適切に設定されています"
            else
                log_warning "Tailwind purge設定: 未使用CSS削除の設定を推奨します"
            fi
        fi
    else
        log_info "CSS フレームワーク: カスタムCSS使用中"
    fi
else
    log_info "外部CSSファイルは見つかりませんでした"
fi

# 5. TypeScript コンパイル性能
log_info "5. TypeScript コンパイル性能測定実行中..."

if [ -f "tsconfig.json" ]; then
    tsc_start=$(date +%s%3N 2>/dev/null || date +%s000)
    if npx tsc --noEmit > /tmp/tsc-check.log 2>&1; then
        tsc_end=$(date +%s%3N 2>/dev/null || date +%s000)
        tsc_time=$(echo "scale=3; ($tsc_end - $tsc_start) / 1000" | bc -l 2>/dev/null || echo "N/A")
        
        if [ "$tsc_time" != "N/A" ]; then
            log_info "TypeScriptコンパイル時間: ${tsc_time}秒"
            
            if (( $(echo "$tsc_time > 10" | bc -l 2>/dev/null || echo 0) )); then
                log_warning "TypeScriptコンパイル時間が長すぎます (${tsc_time}秒 > 10秒)"
            else
                log_success "TypeScriptコンパイル時間: 良好です"
            fi
        fi
    else
        log_error "TypeScriptコンパイルエラーが発生しました"
        cat /tmp/tsc-check.log
    fi
fi

# 6. Core Web Vitals 対応チェック
log_info "6. Core Web Vitals 対応チェック実行中..."

# Next.js Web Vitals の設定確認
webvitals_found=false
if grep -r -q "reportWebVitals\|web-vitals" src/ 2>/dev/null; then
    log_success "Web Vitals: 測定設定が見つかりました"
    webvitals_found=true
fi

if grep -q "web-vitals" package.json 2>/dev/null; then
    log_success "Web Vitals: web-vitals パッケージがインストールされています"
    webvitals_found=true
fi

if [ "$webvitals_found" = false ]; then
    log_warning "Web Vitals: Core Web Vitals測定の設定を推奨します"
    log_info "参考: https://nextjs.org/docs/advanced-features/measuring-performance"
fi

# 7. 依存関係パフォーマンス分析
log_info "7. 依存関係パフォーマンス分析実行中..."

if [ -f "package.json" ]; then
    # node_modules サイズ
    if [ -d "node_modules" ]; then
        node_modules_size_kb=$(du -sk node_modules | cut -f1)
        node_modules_size_mb=$(echo "scale=2; $node_modules_size_kb / 1024" | bc -l 2>/dev/null || echo "N/A")
        log_info "node_modules サイズ: ${node_modules_size_mb} MB"
        
        # 大きなパッケージの特定
        log_info "大きなパッケージ (上位5個):"
        du -sm node_modules/* 2>/dev/null | sort -nr | head -5 | while read size dir; do
            echo "  - $(basename "$dir"): ${size} MB"
        done || true
    fi
    
    # 本番依存関係数
    prod_deps=$(grep -A 100 '"dependencies"' package.json | grep -c '"[^"]*":' 2>/dev/null || echo "0")
    dev_deps=$(grep -A 100 '"devDependencies"' package.json | grep -c '"[^"]*":' 2>/dev/null || echo "0")
    
    log_info "依存関係: 本番 ${prod_deps}個, 開発 ${dev_deps}個"
    
    if [ "$prod_deps" -gt 50 ]; then
        log_warning "本番依存関係が多すぎる可能性があります ($prod_deps個 > 50個)"
    fi
fi

# クリーンアップ
rm -f /tmp/nextjs-build.log /tmp/tsc-check.log

log_success "フロントエンドパフォーマンステスト完了！"