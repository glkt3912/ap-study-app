'use client';

export default function Simple() {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Simple page loaded - checking CSS');
  }

  return (
    <div className='p-8'>
      <h1 style={{ color: 'red', fontSize: '32px' }} className='mb-4'>
        シンプルテスト
      </h1>
      <p style={{ backgroundColor: 'yellow', padding: '20px' }} className='mb-4'>
        インラインスタイルテスト - これが表示されれば基本は動作
      </p>

      <div className='css-loaded-test mb-4'>🎨 CSS読み込みテスト - これがグラデーションなら成功</div>

      <div className='bg-blue-500 text-white p-4 mb-4 rounded'>Tailwindテスト - この背景が青ければTailwind動作</div>
      <div className='test-red mb-4 rounded'>CSS クラステスト - 赤い背景</div>

      {/* より強力なTailwindテスト */}
      <div className='bg-green-500 text-white p-6 mb-4 rounded-lg shadow-lg'>🟢 Tailwind緑テスト（影付き）</div>

      {/* デバッグ情報 */}
      <div className='mt-8 p-4 border-2 border-gray-400 rounded bg-gray-100'>
        <h2 className='text-lg font-bold mb-2 text-black'>デバッグ情報</h2>
        <p className='text-sm text-gray-700'>ページ: /simple</p>
        <p className='text-sm text-gray-700'>CSS: globals.css + Tailwind</p>
        <p className='text-sm text-gray-700'>期待: 青・赤・緑・グラデーション表示</p>
      </div>
    </div>
  );
}
