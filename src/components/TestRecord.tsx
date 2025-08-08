'use client';

import { useState, useEffect } from 'react';
import { testCategories, afternoonQuestionTypes } from '@/data/studyPlan';
import { apiClient, MorningTest, AfternoonTest } from '../lib/api';

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
      const tests = await apiClient.getMorningTests();
      setMorningTests(
        tests.map(test => ({
          ...test,
          date: new Date(test.date).toISOString().split('T')[0] || '',
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '午前問題記録の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAfternoonTests = async () => {
    try {
      const tests = await apiClient.getAfternoonTests();
      setAfternoonTests(
        tests.map(test => ({
          ...test,
          date: new Date(test.date).toISOString().split('T')[0] || '',
        }))
      );
    } catch (err) {
      // 午後問題記録の取得に失敗
    }
  };

  const handleMorningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMorningTest.category && newMorningTest.totalQuestions > 0 && newMorningTest.timeSpent > 0) {
      try {
        setIsLoading(true);
        const createdTest = await apiClient.createMorningTest({
          ...newMorningTest,
          date: new Date(newMorningTest.date).toISOString(),
        });

        // ローカル状態を更新
        setMorningTests(prevTests => [
          {
            ...createdTest,
            date: new Date(createdTest.date).toISOString().split('T')[0] || '',
          },
          ...prevTests,
        ]);

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
        const createdTest = await apiClient.createAfternoonTest({
          ...newAfternoonTest,
          date: new Date(newAfternoonTest.date).toISOString(),
        });

        // ローカル状態を更新
        setAfternoonTests(prevTests => [
          {
            ...createdTest,
            date: new Date(createdTest.date).toISOString().split('T')[0] || '',
          },
          ...prevTests,
        ]);

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
      <div className='bg-white rounded-lg shadow'>
        <div className='p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>問題演習記録</h2>
          <p className='text-gray-600 mt-1'>午前・午後問題の演習結果を記録して弱点を把握しましょう</p>
        </div>

        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex'>
            <button
              onClick={() => setActiveTab('morning')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'morning'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              午前問題
            </button>
            <button
              onClick={() => setActiveTab('afternoon')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'afternoon'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    <label className='block text-sm font-medium text-gray-700 mb-1'>日付</label>
                    <input
                      type='date'
                      value={newMorningTest.date}
                      onChange={e => setNewMorningTest({ ...newMorningTest, date: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>分野</label>
                    <select
                      value={newMorningTest.category}
                      onChange={e => setNewMorningTest({ ...newMorningTest, category: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
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
                    <label className='block text-sm font-medium text-gray-700 mb-1'>総問題数</label>
                    <input
                      type='number'
                      value={newMorningTest.totalQuestions}
                      onChange={e =>
                        setNewMorningTest({ ...newMorningTest, totalQuestions: parseInt(e.target.value) || 0 })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                      min='1'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>正答数</label>
                    <input
                      type='number'
                      value={newMorningTest.correctAnswers}
                      onChange={e =>
                        setNewMorningTest({ ...newMorningTest, correctAnswers: parseInt(e.target.value) || 0 })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                      min='0'
                      max={newMorningTest.totalQuestions}
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>所要時間 (分)</label>
                    <input
                      type='number'
                      value={newMorningTest.timeSpent}
                      onChange={e => setNewMorningTest({ ...newMorningTest, timeSpent: parseInt(e.target.value) || 0 })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                    placeholder='演習内容や感想を記録してください'
                  />
                </div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? '保存中...' : '記録を追加'}
                </button>
              </form>

              <div className='space-y-4 mt-8'>
                <h3 className='text-lg font-semibold text-gray-900'>演習履歴</h3>
                {morningTests.length === 0 ? (
                  <p className='text-gray-500 text-center py-8'>まだ演習記録がありません</p>
                ) : (
                  <div className='space-y-3'>
                    {morningTests.map(test => (
                      <div key={test.id} className='border rounded-lg p-4 bg-gray-50'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h4 className='font-medium text-gray-900'>{test.category}</h4>
                            <p className='text-sm text-gray-600'>{test.date}</p>
                          </div>
                          <div className='text-right'>
                            <div className='text-sm font-medium text-gray-900'>
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
                <div className='bg-orange-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-orange-600'>
                    {afternoonTests.length > 0
                      ? (afternoonTests.reduce((sum, test) => sum + test.score, 0) / afternoonTests.length).toFixed(1)
                      : '0.0'}
                  </div>
                  <div className='text-sm text-orange-800'>平均得点</div>
                </div>
                <div className='bg-green-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-green-600'>
                    {afternoonTests.length > 0 ? Math.max(...afternoonTests.map(test => test.score)) : 0}
                  </div>
                  <div className='text-sm text-green-800'>最高得点</div>
                </div>
                <div className='bg-purple-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-purple-600'>{afternoonTests.length}</div>
                  <div className='text-sm text-purple-800'>演習回数</div>
                </div>
              </div>

              <form onSubmit={handleAfternoonSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>日付</label>
                    <input
                      type='date'
                      value={newAfternoonTest.date}
                      onChange={e => setNewAfternoonTest({ ...newAfternoonTest, date: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>分野</label>
                    <select
                      value={newAfternoonTest.category}
                      onChange={e => setNewAfternoonTest({ ...newAfternoonTest, category: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
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
                    <label className='block text-sm font-medium text-gray-700 mb-1'>得点</label>
                    <input
                      type='number'
                      value={newAfternoonTest.score}
                      onChange={e => setNewAfternoonTest({ ...newAfternoonTest, score: parseInt(e.target.value) || 0 })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                      min='0'
                      max='100'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>所要時間 (分)</label>
                    <input
                      type='number'
                      value={newAfternoonTest.timeSpent}
                      onChange={e =>
                        setNewAfternoonTest({ ...newAfternoonTest, timeSpent: parseInt(e.target.value) || 0 })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                    placeholder='問題内容や解答のポイントを記録してください'
                  />
                </div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? '保存中...' : '記録を追加'}
                </button>
              </form>

              <div className='space-y-4 mt-8'>
                <h3 className='text-lg font-semibold text-gray-900'>演習履歴</h3>
                {afternoonTests.length === 0 ? (
                  <p className='text-gray-500 text-center py-8'>まだ演習記録がありません</p>
                ) : (
                  <div className='space-y-3'>
                    {afternoonTests.map(test => (
                      <div key={test.id} className='border rounded-lg p-4 bg-gray-50'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h4 className='font-medium text-gray-900'>{test.category}</h4>
                            <p className='text-sm text-gray-600'>{test.date}</p>
                          </div>
                          <div className='text-right'>
                            <div className='text-sm font-medium text-gray-900'>{test.score}点</div>
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
