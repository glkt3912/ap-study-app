'use client';

import { useState, useEffect } from 'react';

interface PerformanceData {
  loadTime: number;
  domReady: number;
  memoryUsage: number | null;
}

// Performance Memory interface for type safety
// interface PerformanceMemory {
//   usedJSHeapSize: number
//   totalJSHeapSize: number
//   jsHeapSizeLimit: number
// }

export default function EnvCheckPage() {
  const [mounted, setMounted] = useState(false);
  const [performance, setPerformance] = useState<PerformanceData>({
    loadTime: 0,
    domReady: 0,
    memoryUsage: null,
  });

  useEffect(() => {
    setMounted(true);

    // パフォーマンス情報収集
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      setPerformance({
        loadTime: Math.round(navigation.loadEventEnd - navigation.startTime),
        domReady: Math.round(navigation.domContentLoadedEventEnd - navigation.startTime),
        memoryUsage:
          'memory' in window.performance
            ? Math.round(
                (window.performance as typeof window.performance & { memory: { usedJSHeapSize: number } }).memory
                  .usedJSHeapSize /
                  1024 /
                  1024
              )
            : null,
      });
    }
  }, []);

  const getNodeVersion = () => {
    if (typeof process !== 'undefined' && process.version) {
      return process.version;
    }
    return 'N/A (ブラウザ環境)';
  };

  const getReactVersion = () => {
    try {
      return require('react/package.json').version;
    } catch {
      return 'Unknown';
    }
  };

  const testLocalStorage = () => {
    try {
      const testKey = 'env-test-' + Date.now();
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return result === 'test' ? '✅ 正常' : '❌ 異常';
    } catch (error) {
      return `❌ エラー: ${error}`;
    }
  };

  const testSessionStorage = () => {
    try {
      const testKey = 'env-test-' + Date.now();
      sessionStorage.setItem(testKey, 'test');
      const result = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      return result === 'test' ? '✅ 正常' : '❌ 異常';
    } catch (error) {
      return `❌ エラー: ${error}`;
    }
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    return browser;
  };

  const getOSInfo = () => {
    const ua = navigator.userAgent;
    let os = 'Unknown';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return os;
  };

  if (!mounted) {
    return <div className='p-8'>環境情報を収集中...</div>;
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 p-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-8'>🖥️ 環境チェック</h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* システム情報 */}
          <div className='card-primary rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4'>💻 システム情報</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='font-medium'>ブラウザ:</span>
                <span>{getBrowserInfo()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>OS:</span>
                <span>{getOSInfo()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>画面解像度:</span>
                <span>
                  {window.screen.width} × {window.screen.height}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>ウィンドウサイズ:</span>
                <span>
                  {window.innerWidth} × {window.innerHeight}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>デバイスピクセル比:</span>
                <span>{window.devicePixelRatio}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>タイムゾーン:</span>
                <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>言語:</span>
                <span>{navigator.language}</span>
              </div>
            </div>
          </div>

          {/* 開発環境情報 */}
          <div className='card-primary rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4'>⚛️ 開発環境</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='font-medium'>Node.js:</span>
                <span>{getNodeVersion()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>React:</span>
                <span>{getReactVersion()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Next.js:</span>
                <span>15.4.5</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>環境:</span>
                <span>{process.env.NODE_ENV || 'development'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>ダークモード:</span>
                <span>{document.documentElement.classList.contains('dark') ? '🌙 ON' : '☀️ OFF'}</span>
              </div>
            </div>
          </div>

          {/* パフォーマンス情報 */}
          <div className='card-primary rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4'>⚡ パフォーマンス</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='font-medium'>ページ読み込み時間:</span>
                <span className={performance.loadTime > 3000 ? 'text-red-500' : 'text-green-500'}>
                  {performance.loadTime}ms
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>DOM準備完了:</span>
                <span className={performance.domReady > 2000 ? 'text-red-500' : 'text-green-500'}>
                  {performance.domReady}ms
                </span>
              </div>
              {performance.memoryUsage && (
                <div className='flex justify-between'>
                  <span className='font-medium'>メモリ使用量:</span>
                  <span className={performance.memoryUsage > 50 ? 'text-red-500' : 'text-green-500'}>
                    {performance.memoryUsage}MB
                  </span>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='font-medium'>接続状態:</span>
                <span className={navigator.onLine ? 'text-green-500' : 'text-red-500'}>
                  {navigator.onLine ? '🟢 オンライン' : '🔴 オフライン'}
                </span>
              </div>
            </div>
          </div>

          {/* ストレージテスト */}
          <div className='card-primary rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4'>💾 ストレージテスト</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='font-medium'>LocalStorage:</span>
                <span>{testLocalStorage()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>SessionStorage:</span>
                <span>{testSessionStorage()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Cookie有効:</span>
                <span className={navigator.cookieEnabled ? 'text-green-500' : 'text-red-500'}>
                  {navigator.cookieEnabled ? '✅ 有効' : '❌ 無効'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Service Worker:</span>
                <span>{'serviceWorker' in navigator ? '✅ サポート' : '❌ 非サポート'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 診断コマンド */}
        <div className='mt-8 bg-slate-800 text-green-400 p-6 rounded-lg font-mono text-sm'>
          <h3 className='text-lg font-bold mb-4 text-green-300'>🔧 開発者向けコマンド</h3>
          <div className='space-y-2'>
            <div>
              キャッシュクリア: <code className='bg-slate-700 px-2 py-1 rounded'>rm -rf .next && npm run build</code>
            </div>
            <div>
              依存関係更新: <code className='bg-slate-700 px-2 py-1 rounded'>npm install</code>
            </div>
            <div>
              開発サーバー: <code className='bg-slate-700 px-2 py-1 rounded'>npm run dev</code>
            </div>
            <div>
              ビルドテスト: <code className='bg-slate-700 px-2 py-1 rounded'>npm run build</code>
            </div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className='mt-8 text-center'>
          <button
            onClick={() => window.history.back()}
            className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200'
          >
            ← 前のページに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
