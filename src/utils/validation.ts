// バリデーション用のユーティリティ関数

/**
 * 文字列がメールアドレス形式かどうかをチェック
 */
export function isEmailFormat(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 文字列がユーザー名形式かどうかをチェック
 * ユーザー名の条件: 3-20文字、英数字とアンダースコア、ハイフンのみ
 */
export function isUsernameFormat(value: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(value);
}

/**
 * 入力値がメールアドレスかユーザー名かを判定
 */
export function determineLoginType(value: string): 'email' | 'username' | 'invalid' {
  if (isEmailFormat(value)) {
    return 'email';
  } else if (isUsernameFormat(value)) {
    return 'username';
  } else {
    return 'invalid';
  }
}

/**
 * ログイン入力値の基本的なバリデーション
 */
export function validateLoginInput(emailOrUsername: string, password: string): {
  isValid: boolean;
  errors: string[];
  loginType: 'email' | 'username' | 'invalid';
} {
  const errors: string[] = [];
  
  if (!emailOrUsername.trim()) {
    errors.push('メールアドレスまたはユーザー名を入力してください');
  }
  
  if (!password.trim()) {
    errors.push('パスワードを入力してください');
  }
  
  if (password.length < 6) {
    errors.push('パスワードは6文字以上で入力してください');
  }
  
  const loginType = determineLoginType(emailOrUsername.trim());
  
  if (loginType === 'invalid' && emailOrUsername.trim()) {
    errors.push('有効なメールアドレスまたはユーザー名を入力してください');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    loginType,
  };
}