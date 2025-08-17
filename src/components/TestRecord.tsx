'use client';

import { useState, useEffect } from 'react';
import { testCategories, afternoonQuestionTypes } from '@/data/studyPlan';
import { apiClient, MorningTest, AfternoonTest } from '../lib/api';
import { unifiedApiClient } from '../lib/unified-api';

export default function TestRecord() {
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon'>('morning');
  const [morningTests, setMorningTests] = useState<MorningTest[]>([]);
  const [afternoonTests, setAfternoonTests] = useState<AfternoonTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMorningTest, setNewMorningTest] = useState<Omit<MorningTest, 'id' | 'accuracy'>>({
    date: new Date().toISOString().split('T')[0] || '',
    category: '',
    totalQuestions: 10,
    correctAnswers: 0,
    timeSpent: 0,
    memo: '',
  });

  const [newAfternoonTest, setNewAfternoonTest] = useState<Omit<AfternoonTest, 'id'>>({
    date: new Date().toISOString().split('T')[0] || '',
    category: '',
    score: 0,
    timeSpent: 0,
    memo: '',
  });

  // データ取得
  useEffect(() => {
    fetchMorningTests();
    fetchAfternoonTests();
  }, []);

  const fetchMorningTests = async () => {
    try {
      setIsLoading(true);
      
      // 統一APIを使用してテストセッションを取得
      try {
        const sessions = await unifiedApiClient.getTestSessions(1, 50, 0);
        const morningOnlyTests = sessions
          .filter(session => session.type === 'morning')
          .map(session => ({
            id: session.id,
            date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
            category: session.category || '',
            totalQuestions: session.totalQuestions || 0,
            correctAnswers: session.correctAnswers || 0,
            accuracy: session.totalQuestions ? 
              Math.round((session.correctAnswers || 0) / session.totalQuestions * 100) : 0,
            timeSpent: session.timeSpent || 0,
            memo: session.memo || ''
          })) as MorningTest[];
        
        setMorningTests(morningOnlyTests);
      } catch (unifiedError) {
        console.warn('統一API失敗、レガシーAPIにフォールバック:', unifiedError);
        // フォールバック: 既存APIを使用
        const tests = await apiClient.getMorningTests();
        setMorningTests(
          tests.map(test => ({
            ...test,
            date: new Date(test.date).toISOString().split('T')[0] || '',
          }))
        );
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '午前問題記録の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAfternoonTests = async () => {
    try {
      // 統一APIを使用してテストセッションを取得
      try {
        const sessions = await unifiedApiClient.getTestSessions(1, 50, 0);
        const afternoonOnlyTests = sessions
          .filter(session => session.type === 'afternoon')
          .map(session => ({
            id: session.id,
            date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
            category: session.category || '',
            score: session.score || 0,
            timeSpent: session.timeSpent || 0,
            memo: session.memo || ''
          })) as AfternoonTest[];
        
        setAfternoonTests(afternoonOnlyTests);
      } catch (unifiedError) {
        console.warn('統一API失敗、レガシーAPIにフォールバック:', unifiedError);
        // フォールバック: 既存APIを使用
        const tests = await apiClient.getAfternoonTests();
        setAfternoonTests(
          tests.map(test => ({
            ...test,
            date: new Date(test.date).toISOString().split('T')[0] || '',
          }))
        );
      }
    } catch (err) {
      // 午後問題記録の取得に失敗
      console.error('午後問題記録の取得エラー:', err);
    }
  };

  const handleMorningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMorningTest.category && newMorningTest.totalQuestions > 0 && newMorningTest.timeSpent > 0) {
      try {
        setIsLoading(true);
        
        // 統一APIを使用してテストセッションを作成
        try {
          const createdSession = await unifiedApiClient.createTestSession(1, {
            sessionType: 'morning',
            category: newMorningTest.category,
            totalQuestions: newMorningTest.totalQuestions,
            correctAnswers: newMorningTest.correctAnswers,
            timeSpentMinutes: Math.round(newMorningTest.timeSpent / 60), // 秒から分に変換
            notes: newMorningTest.memo || undefined,
            startedAt: new Date(newMorningTest.date),
            isCompleted: true,
          });

          // 統一APIレスポンスを既存形式に変換してローカル状態を更新
          const convertedTest: MorningTest = {
            id: createdSession.id,
            date: newMorningTest.date,
            category: createdSession.category || '',
            totalQuestions: createdSession.totalQuestions || 0,
            correctAnswers: createdSession.correctAnswers || 0,
            accuracy: createdSession.totalQuestions ? 
              Math.round((createdSession.correctAnswers || 0) / createdSession.totalQuestions * 100) : 0,
            timeSpent: createdSession.timeSpent || 0,
            memo: createdSession.memo || ''
          };

          setMorningTests(prevTests => [convertedTest, ...prevTests]);
        } catch (unifiedError) {
          console.warn('統一API失敗、レガシーAPIにフォールバック:', unifiedError);
          // フォールバック: 既存APIを使用
          const createdTest = await apiClient.createMorningTest({
            ...newMorningTest,
            date: new Date(newMorningTest.date).toISOString(),
          });

          setMorningTests(prevTests => [
            {
              ...createdTest,
              date: new Date(createdTest.date).toISOString().split('T')[0] || '',
            },
            ...prevTests,
          ]);
        }

        // フォームをリセット
        setNewMorningTest({
          date: new Date().toISOString().split('T')[0] || '',
          category: '',
          totalQuestions: 10,
          correctAnswers: 0,
          timeSpent: 0,
          memo: '',
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '午前問題記録の作成に失敗しました');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAfternoonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAfternoonTest.category && newAfternoonTest.score >= 0 && newAfternoonTest.timeSpent > 0) {
      try {
        setIsLoading(true);
        
        // 統一APIを使用してテストセッションを作成
        try {
          const createdSession = await unifiedApiClient.createTestSession(1, {
            sessionType: 'afternoon',
            category: newAfternoonTest.category,
            score: newAfternoonTest.score,
            timeSpentMinutes: Math.round(newAfternoonTest.timeSpent / 60), // 秒から分に変換
            notes: newAfternoonTest.memo || undefined,
            startedAt: new Date(newAfternoonTest.date),
            isCompleted: true,
          });

          // 統一APIレスポンスを既存形式に変換してローカル状態を更新
          const convertedTest: AfternoonTest = {
            id: createdSession.id,
            date: newAfternoonTest.date,
            category: createdSession.category || '',
            score: createdSession.score || 0,
            timeSpent: createdSession.timeSpent || 0,
            memo: createdSession.memo || ''
          };

          setAfternoonTests(prevTests => [convertedTest, ...prevTests]);
        } catch (unifiedError) {
          console.warn('統一API失敗、レガシーAPIにフォールバック:', unifiedError);
          // フォールバック: 既存APIを使用
          const createdTest = await apiClient.createAfternoonTest({
            ...newAfternoonTest,
            date: new Date(newAfternoonTest.date).toISOString(),
          });

          setAfternoonTests(prevTests => [
            {
              ...createdTest,
              date: new Date(createdTest.date).toISOString().split('T')[0] || '',
            },
            ...prevTests,
          ]);
        }

        // フォームをリセット
        setNewAfternoonTest({
          date: new Date().toISOString().split('T')[0] || '',
          category: '',
          score: 0,
          timeSpent: 0,
          memo: '',
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '午後問題記録の作成に失敗しました');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getMorningStats = () => {
    if (morningTests.length === 0) return { averageScore: 0, totalQuestions: 0 };

    const totalQuestions = morningTests.reduce((acc, test) => acc + test.totalQuestions, 0);
    const totalCorrect = morningTests.reduce((acc, test) => acc + test.correctAnswers, 0);

    return {
      averageScore: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      totalQuestions: totalQuestions,
    };
  };

  const morningStats = getMorningStats();

  return (
    <div className='space-y-6'>
      <div className='card-primary shadow-moderate'>
        <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>問題演習記録</h2>
          <p className='text-secondary mt-1'>午前・午後問題の演習結果を記録して弱点を把握しましょう</p>
        </div>

        <div className='border-b border-slate-200 dark:border-slate-700'>
          <nav className='-mb-px flex'>
            <button
              onClick={() => setActiveTab('morning')}
              className={`nav-tab ${
                activeTab === 'morning'
                  ? 'nav-tab-active'
                  : 'nav-tab-inactive'
              }`}
            >
              午前問題
            </button>
            <button
              onClick={() => setActiveTab('afternoon')}
              className={`nav-tab ${
                activeTab === 'afternoon'
                  ? 'nav-tab-active'
                  : 'nav-tab-inactive'
              }`}
            >
              午後問題
            </button>
          </nav>
        </div>

        <div className='p-6'>
          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-red-600 text-sm'>{error}</p>
            </div>
          )}

          {activeTab === 'morning' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-blue-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-blue-600'>{morningStats.averageScore.toFixed(1)}%</div>
                  <div className='text-sm text-blue-800'>平均正答率</div>
                </div>
                <div className='bg-green-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-green-600'>{morningStats.totalQuestions}</div>
                  <div className='text-sm text-green-800'>総問題数</div>
                </div>
                <div className='bg-purple-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-purple-600'>{morningTests.length}</div>
                  <div className='text-sm text-purple-800'>演習回数</div>
                </div>
              </div>

              <form onSubmit={handleMorningSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='label-primary'>日付</label>
                    <input
                      type='date'
                      value={newMorningTest.date}
                      onChange={e => setNewMorningTest({ ...newMorningTest, date: e.target.value })}
                      className='input-primary'
                    />
                  </div>
                  <div>
                    <label className='label-primary'>分野</label>
                    <select
                      value={newMorningTest.category}
                      onChange={e => setNewMorningTest({ ...newMorningTest, category: e.target.value })}
                      className='input-primary'
                      required
                    >
                      <option value=''>分野を選択</option>
                      {testCategories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='label-primary'>総問題数</label>
                    <input
                      type='number'
                      value={newMorningTest.totalQuestions}
                      onChange={e =>
                        setNewMorningTest({ ...newMorningTest, totalQuestions: parseInt(e.target.value) || 0 })
                      }
                      className='input-primary'
                      min='1'
                      required
                    />
                  </div>
                  <div>
                    <label className='label-primary'>正答数</label>
                    <input
                      type='number'
                      value={newMorningTest.correctAnswers}
                      onChange={e =>
                        setNewMorningTest({ ...newMorningTest, correctAnswers: parseInt(e.target.value) || 0 })
                      }
                      className='input-primary'
                      min='0'
                      max={newMorningTest.totalQuestions}
                      required
                    />
                  </div>
                  <div>
                    <label className='label-primary'>所要時間 (分)</label>
                    <input
                      type='number'
                      value={newMorningTest.timeSpent}
                      onChange={e => setNewMorningTest({ ...newMorningTest, timeSpent: parseInt(e.target.value) || 0 })}
                      className='input-primary'
                      min='1'
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>メモ</label>
                  <textarea
                    value={newMorningTest.memo || ''}
                    onChange={e => setNewMorningTest({ ...newMorningTest, memo: e.target.value })}
                    rows={3}
                    className='input-primary'
                    placeholder='演習内容や感想を記録してください'
                  />
                </div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='btn-primary hover-lift click-shrink focus-ring interactive-disabled'
                >
                  {isLoading ? '保存中...' : '記録を追加'}
                </button>
              </form>

              <div className='space-y-4 mt-8'>
                <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>演習履歴</h3>
                {morningTests.length === 0 ? (
                  <p className='text-gray-500 dark:text-gray-400 text-center py-8'>まだ演習記録がありません</p>
                ) : (
                  <div className='space-y-3'>
                    {morningTests.map(test => (
                      <div key={test.id} className='card-secondary p-4 hover-lift'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h4 className='font-medium text-slate-900 dark:text-slate-100'>{test.category}</h4>
                            <p className='text-sm text-gray-600'>{test.date}</p>
                          </div>
                          <div className='text-right'>
                            <div className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                              {test.correctAnswers}/{test.totalQuestions} (
                              {test.accuracy?.toFixed(1) ||
                                ((test.correctAnswers / test.totalQuestions) * 100).toFixed(1)}
                              %)
                            </div>
                            <div className='text-xs text-gray-500'>{test.timeSpent}分</div>
                          </div>
                        </div>
                        {test.memo && <p className='text-sm text-gray-700 bg-white p-2 rounded border'>{test.memo}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'afternoon' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='metric-card hover-lift'>
                  <div className='metric-value text-orange-600'>
                    {afternoonTests.length > 0
                      ? (afternoonTests.reduce((sum, test) => sum + test.score, 0) / afternoonTests.length).toFixed(1)
                      : '0.0'}
                  </div>
                  <div className='metric-label text-orange-800'>平均得点</div>
                </div>
                <div className='metric-card hover-lift'>
                  <div className='metric-value text-green-600'>
                    {afternoonTests.length > 0 ? Math.max(...afternoonTests.map(test => test.score)) : 0}
                  </div>
                  <div className='metric-label text-green-800'>最高得点</div>
                </div>
                <div className='metric-card hover-lift'>
                  <div className='metric-value text-purple-600'>{afternoonTests.length}</div>
                  <div className='metric-label text-purple-800'>演習回数</div>
                </div>
              </div>

              <form onSubmit={handleAfternoonSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='label-primary'>日付</label>
                    <input
                      type='date'
                      value={newAfternoonTest.date}
                      onChange={e => setNewAfternoonTest({ ...newAfternoonTest, date: e.target.value })}
                      className='input-primary'
                      required
                    />
                  </div>
                  <div>
                    <label className='label-primary'>分野</label>
                    <select
                      value={newAfternoonTest.category}
                      onChange={e => setNewAfternoonTest({ ...newAfternoonTest, category: e.target.value })}
                      className='input-primary'
                      required
                    >
                      <option value=''>分野を選択</option>
                      {afternoonQuestionTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='label-primary'>得点</label>
                    <input
                      type='number'
                      value={newAfternoonTest.score}
                      onChange={e => setNewAfternoonTest({ ...newAfternoonTest, score: parseInt(e.target.value) || 0 })}
                      className='input-primary'
                      min='0'
                      max='100'
                      required
                    />
                  </div>
                  <div>
                    <label className='label-primary'>所要時間 (分)</label>
                    <input
                      type='number'
                      value={newAfternoonTest.timeSpent}
                      onChange={e =>
                        setNewAfternoonTest({ ...newAfternoonTest, timeSpent: parseInt(e.target.value) || 0 })
                      }
                      className='input-primary'
                      min='1'
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>メモ</label>
                  <textarea
                    value={newAfternoonTest.memo || ''}
                    onChange={e => setNewAfternoonTest({ ...newAfternoonTest, memo: e.target.value })}
                    rows={3}
                    className='input-primary'
                    placeholder='問題内容や解答のポイントを記録してください'
                  />
                </div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='btn-primary hover-lift click-shrink focus-ring interactive-disabled'
                >
                  {isLoading ? '保存中...' : '記録を追加'}
                </button>
              </form>

              <div className='space-y-4 mt-8'>
                <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>演習履歴</h3>
                {afternoonTests.length === 0 ? (
                  <p className='text-gray-500 dark:text-gray-400 text-center py-8'>まだ演習記録がありません</p>
                ) : (
                  <div className='space-y-3'>
                    {afternoonTests.map(test => (
                      <div key={test.id} className='card-secondary p-4 hover-lift'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h4 className='font-medium text-slate-900 dark:text-slate-100'>{test.category}</h4>
                            <p className='text-sm text-gray-600'>{test.date}</p>
                          </div>
                          <div className='text-right'>
                            <div className='text-sm font-medium text-slate-900 dark:text-slate-100'>{test.score}点</div>
                            <div className='text-xs text-gray-500'>{test.timeSpent}分</div>
                          </div>
                        </div>
                        {test.memo && <p className='text-sm text-gray-700 bg-white p-2 rounded border'>{test.memo}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
