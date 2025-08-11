'use client';

interface Tab {
  id: string;
  name: string;
  icon: string;
}

interface AppNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (_tabId: string) => void;
}

export function AppNavigation({ tabs, activeTab, onTabChange }: AppNavigationProps) {
  return (
    <nav className='app-navigation'>
      <div className='container-primary relative'>
        {/* スクロール可能なタブナビゲーション */}
        <div className='overflow-x-auto scrollbar-modern relative'>
          <div className='flex min-w-max px-2'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`nav-tab hover-lift click-shrink focus-ring flex items-center ${
                  activeTab === tab.id
                    ? 'nav-tab-active'
                    : 'nav-tab-inactive'
                }`}
              >
                <span className='mr-1 sm:mr-2 text-base'>{tab.icon}</span>
                <span className='text-xs sm:text-sm'>{tab.name}</span>
                {activeTab === tab.id && (
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-lg -z-10' />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* スクロールヒント - 小画面のみ表示 */}
        <div className='sm:hidden card-accent px-3 py-1 text-xs text-center text-muted backdrop-blur-sm mt-2'>
          ← スワイプでスクロール →
        </div>
      </div>
    </nav>
  );
}