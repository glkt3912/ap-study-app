#!/bin/bash

# =================================================================
# フロントエンドセキュリティチェックスクリプト
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

log_info "フロントエンドセキュリティチェックを開始..."

cd "$PROJECT_ROOT"

# 1. npm auditセキュリティスキャン
log_info "1. npm auditセキュリティスキャン実行中..."

if npm audit --audit-level moderate; then
    log_success "npm audit: セキュリティ脆弱性は検出されませんでした"
else
    log_error "npm audit: セキュリティ脆弱性が検出されました。修正が必要です。"
    exit 1
fi

# 2. XSS脆弱性チェック
log_info "2. XSS脆弱性チェック実行中..."

# 危険なReact パターンを検索
XSS_PATTERNS=(
    'dangerouslySetInnerHTML'           # innerHTML直接操作
    '\$\{[^}]*\}.*[<>]'                # テンプレートリテラル内HTML
    'innerHTML.*='                      # innerHTML代入
    'document\.write'                   # document.write使用
    'eval\('                           # eval使用
    'new Function\('                   # Function constructor
    'localStorage\.setItem.*[<>]'      # localStorage XSS
    'sessionStorage\.setItem.*[<>]'    # sessionStorage XSS
)

EXCLUSIONS=(
    "node_modules/"
    ".next/"
    "coverage/"
    ".git/"
    "dist/"
    "build/"
)

# 除外パターンの構築
EXCLUDE_PATTERN=""
for exclusion in "${EXCLUSIONS[@]}"; do
    EXCLUDE_PATTERN="$EXCLUDE_PATTERN --exclude-dir=$exclusion"
done

xss_found=false
for pattern in "${XSS_PATTERNS[@]}"; do
    if grep -r -i -E $EXCLUDE_PATTERN "$pattern" src/ 2>/dev/null; then
        log_warning "XSS脆弱性の可能性: $pattern"
        xss_found=true
    fi
done

if [ "$xss_found" = false ]; then
    log_success "XSSチェック: 危険なパターンは検出されませんでした"
else
    log_warning "XSSチェック: 潜在的リスクが検出されました。レビューしてください。"
fi

# 3. CSP (Content Security Policy) 設定チェック
log_info "3. CSP設定チェック実行中..."

csp_files=$(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | grep -E "(next\.config|middleware)" | head -5)
csp_found=false

for file in $csp_files; do
    if [ -f "$file" ] && grep -q -i "content.*security.*policy\|csp" "$file" 2>/dev/null; then
        log_success "CSP設定が見つかりました: $file"
        csp_found=true
    fi
done

if [ "$csp_found" = false ]; then
    log_warning "CSP設定: Content Security Policyの設定が見当たりません"
else
    log_success "CSP設定: 適切に設定されています"
fi

# 4. 機密情報漏洩チェック（フロントエンド特化）
log_info "4. 機密情報漏洩チェック実行中..."

# フロントエンド特有の機密情報パターン
SENSITIVE_PATTERNS=(
    "process\.env\.[A-Z_]*SECRET"       # シークレット環境変数
    "process\.env\.[A-Z_]*KEY"          # キー環境変数
    "process\.env\.[A-Z_]*TOKEN"        # トークン環境変数
    "api[_-]?key.*=.*['\"][^'\"]{10,}"  # APIキー
    "access[_-]?token.*=.*['\"][^'\"]{10,}" # アクセストークン
    "bearer.*['\"][^'\"]{20,}"          # Bearer トークン
    "sk-[a-zA-Z0-9]{20,}"              # OpenAI APIキー形式
)

sensitive_found=false
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -r -i -E $EXCLUDE_PATTERN "$pattern" src/ 2>/dev/null; then
        log_error "機密情報の可能性: $pattern"
        sensitive_found=true
    fi
done

if [ "$sensitive_found" = false ]; then
    log_success "機密情報チェック: 問題ありません"
else
    log_error "機密情報チェック: 機密情報の可能性がある文字列が検出されました"
    exit 1
fi

# 5. 環境変数設定チェック
log_info "5. 環境変数設定チェック実行中..."

# .env.example と実際の使用をチェック
if [ -f ".env.example" ]; then
    log_success "環境変数テンプレート: .env.exampleが存在します"
    
    # 公開用環境変数のチェック
    public_env_count=$(grep -c "NEXT_PUBLIC_" .env.example 2>/dev/null || echo "0")
    log_info "公開環境変数数: $public_env_count個"
    
    if [ "$public_env_count" -gt 0 ]; then
        log_warning "公開環境変数使用: $public_env_count個の NEXT_PUBLIC_ 変数があります"
        log_info "機密情報が含まれていないことを確認してください"
    fi
else
    log_warning "環境変数テンプレート: .env.exampleファイルがありません"
fi

# 6. HTTPS強制チェック
log_info "6. HTTPS強制設定チェック実行中..."

https_configs=(
    "next.config.js"
    "middleware.ts" 
    "middleware.js"
)

https_found=false
for config in "${https_configs[@]}"; do
    if [ -f "$config" ]; then
        if grep -q -i "https\|secure\|redirect.*ssl" "$config" 2>/dev/null; then
            log_success "HTTPS設定が見つかりました: $config"
            https_found=true
        fi
    fi
done

if [ "$https_found" = false ]; then
    log_warning "HTTPS強制: 本番環境でのHTTPS強制設定を推奨します"
else
    log_success "HTTPS強制: 適切に設定されています"
fi

# 7. 依存関係の既知脆弱性チェック
log_info "7. 依存関係脆弱性チェック実行中..."

if [ -f "package.json" ]; then
    # 古いパッケージの警告
    outdated_packages=$(npm outdated --depth=0 2>/dev/null | wc -l || echo "0")
    
    if [ "$outdated_packages" -gt 5 ]; then
        log_warning "依存関係: $outdated_packages個のパッケージが古くなっています"
    else
        log_success "依存関係: パッケージは比較的新しい状態です"
    fi
    
    # 重要なセキュリティパッケージのチェック
    security_packages=("helmet" "cors" "express-rate-limit")
    missing_packages=()
    
    for package in "${security_packages[@]}"; do
        if ! grep -q "\"$package\"" package.json; then
            missing_packages+=("$package")
        fi
    done
    
    if [ ${#missing_packages[@]} -gt 0 ]; then
        log_info "推奨セキュリティパッケージ: ${missing_packages[*]} の導入を検討してください"
    fi
fi

log_success "フロントエンドセキュリティチェック完了！"