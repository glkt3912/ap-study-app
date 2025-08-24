'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface StudyLogEntry {
  id?: number;
  date: string;
  subject: string;
  topics: string[];
  studyTime: number;
  understanding: number;
  memo?: string;
  efficiency?: number;
}

export default function StudyLog() {
  const [logs, setLogs] = useState<StudyLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newLog, setNewLog] = useState<StudyLogEntry>({
    date: new Date().toISOString().split('T')[0] || '',
    subject: '',
    topics: [],
    studyTime: 0,
    understanding: 0,
    memo: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'time' | 'understanding'>('date');

  const subjects = [
    'コンピュータの基礎理論',
    'アルゴリズムとデータ構造',
    'ハードウェア基礎',
    'ソフトウェア基礎',
    'データベース基礎',
    'ネットワーク基礎',
    'セキュリティ基礎',
    'システム開発技法',
    'プロジェクトマネジメント',
    'サービスマネジメント',
    '午前問題演習',
    '午後問題演習',
  ];

  // データ取得
  useEffect(() => {
    fetchStudyLogs();
  }, []);

  const fetchStudyLogs = async () => {
    try {
      setIsLoading(true);
      const studyLogs = await apiClient.getStudyLogs();
      
      setLogs(
        studyLogs.map(log => {
          return {
            ...log,
            date: new Date(log.date).toISOString().split('T')[0] || '',
            // topicsが配列でない場合の安全な変換
            topics: Array.isArray(log.topics) 
              ? log.topics.map((topic: any) => typeof topic === 'string' ? topic : String(topic))
              : typeof log.topics === 'string' 
                ? [log.topics] 
                : []
          };
        })
      );
      setError(null);
    } catch (err) {
      console.error('StudyLog fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : '学習記録の取得に失敗しました';
      setError(`学習記録の取得エラー: ${errorMessage}`);
      // エラーでも空の配列で継続
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.subject && newLog.studyTime > 0 && newLog.topics.length > 0) {
      try {
        setIsLoading(true);
        const createdLog = await apiClient.createStudyLog({
          ...newLog,
          date: new Date(newLog.date).toISOString(),
        });

        // ローカル状態を更新
        setLogs(prevLogs => [
          {
            ...createdLog,
            date: new Date(createdLog.date).toISOString().split('T')[0] || '',
            // topicsの安全な変換
            topics: Array.isArray(createdLog.topics) 
              ? createdLog.topics.map((topic: any) => typeof topic === 'string' ? topic : String(topic))
              : typeof createdLog.topics === 'string' 
                ? [createdLog.topics] 
                : []
          },
          ...prevLogs,
        ]);

        // フォームをリセット
        setNewLog({
          date: new Date().toISOString().split('T')[0] || '',
          subject: '',
          topics: [],
          studyTime: 0,
          understanding: 0,
          memo: '',
        });
        setTopicInput('');
        setError(null);
      } catch (err) {
        console.error('StudyLog creation error:', err);
        const errorMessage = err instanceof Error ? err.message : '学習記録の作成に失敗しました';
        setError(`学習記録の作成エラー: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 候補取得処理
  const fetchSuggestions = async (query: string, subject?: string) => {
    try {
      const options: { query?: string; subject?: string } = { query };
      if (subject) {
        options.subject = subject;
      }
      const result = await apiClient.getTopicSuggestions(options);
      setSuggestions(result.suggestions);
      setShowSuggestions(true);
    } catch (err) {
      // 候補取得失敗は通常動作に影響しないため、サイレントに処理
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 学習項目入力時の候補表示処理
  const handleTopicInputChange = (value: string) => {
    setTopicInput(value);
    if (value.trim().length > 0) {
      fetchSuggestions(value, newLog.subject);
    } else {
      setShowSuggestions(false);
    }
  };

  // 候補選択処理
  const selectSuggestion = (suggestion: string) => {
    if (!newLog.topics.includes(suggestion)) {
      setNewLog({
        ...newLog,
        topics: [...newLog.topics, suggestion],
      });
    }
    setTopicInput('');
    setShowSuggestions(false);
  };

  const addTopic = () => {
    if (topicInput.trim() && !newLog.topics.includes(topicInput.trim())) {
      setNewLog({
        ...newLog,
        topics: [...newLog.topics, topicInput.trim()],
      });
      setTopicInput('');
      setShowSuggestions(false);
    }
  };

  const removeTopic = (indexToRemove: number) => {
    setNewLog({
      ...newLog,
      topics: newLog.topics.filter((_, index) => index !== indexToRemove),
    });
  };

  // フィルタリング機能
  const getFilteredLogs = () => {
    let filtered = [...logs];

    // 科目フィルター
    if (selectedSubject) {
      filtered = filtered.filter(log => log.subject === selectedSubject);
    }

    // 日付範囲フィルター
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      if (selectedDateRange === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (selectedDateRange === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(log => new Date(log.date) >= cutoffDate);
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'subject':
          return a.subject.localeCompare(b.subject);
        case 'time':
          return b.studyTime - a.studyTime;
        case 'understanding':
          return b.understanding - a.understanding;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // フィルタリングされたデータの統計
  const getFilteredStats = () => {
    const filtered = getFilteredLogs();
    const totalTime = filtered.reduce((total, log) => total + log.studyTime, 0);
    const avgUnderstanding =
      filtered.length > 0 ? filtered.reduce((total, log) => total + log.understanding, 0) / filtered.length : 0;

    // 科目別統計
    const subjectStats: { [key: string]: { time: number; count: number; understanding: number } } = {};
    filtered.forEach(log => {
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = { time: 0, count: 0, understanding: 0 };
      }
      const subjectData = subjectStats[log.subject];
      if (subjectData) {
        subjectData.time += log.studyTime;
        subjectData.count += 1;
        subjectData.understanding += log.understanding;
      }
    });

    const topSubjects = Object.entries(subjectStats)
      .map(([subject, stats]) => ({
        subject,
        time: stats.time,
        count: stats.count,
        avgUnderstanding: stats.understanding / stats.count,
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 3);

    return {
      count: filtered.length,
      totalTime,
      avgUnderstanding,
      topSubjects,
    };
  };

  return (
    <div className='space-y-6'>
      <div className='card-primary shadow-moderate hover-lift'>
        <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>学習記録</h2>
          <p className='text-gray-600 dark:text-gray-300 mt-1'>日々の学習内容を記録して進捗を管理しましょう</p>
        </div>

        <div className='p-6'>
          {error && (
            <div className='mb-4 alert-error'>
              <p className='text-red-600 text-sm'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4 mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label-primary'>日付</label>
                <input
                  type='date'
                  value={newLog.date}
                  onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                  className='input-primary'
                  required
                />
              </div>

              <div>
                <label className='label-primary'>科目</label>
                <select
                  value={newLog.subject}
                  onChange={e => {
                    setNewLog({ ...newLog, subject: e.target.value });
                    // 科目変更時に候補を更新
                    if (topicInput.trim().length > 0) {
                      fetchSuggestions(topicInput, e.target.value);
                    }
                  }}
                  className='input-primary'
                  required
                >
                  <option value=''>科目を選択</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='label-primary'>学習時間 (分)</label>
                <input
                  type='number'
                  value={newLog.studyTime}
                  onChange={e => setNewLog({ ...newLog, studyTime: parseInt(e.target.value) || 0 })}
                  className='input-primary'
                  min='1'
                  required
                />
              </div>

              <div>
                <label className='label-primary'>理解度 (1-5)</label>
                <div className='flex space-x-2 pt-2'>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type='button'
                      onClick={() => setNewLog({ ...newLog, understanding: rating })}
                      className={`w-8 h-8 rounded-full text-sm click-shrink focus-ring ${
                        newLog.understanding >= rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover-lift'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 学習項目入力 */}
            <div className='relative'>
              <label className='label-primary'>学習項目</label>
              <div className='flex space-x-2 mb-2 relative'>
                <div className='flex-1 relative'>
                  <input
                    type='text'
                    value={topicInput}
                    onChange={e => handleTopicInputChange(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTopic();
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (topicInput.trim().length > 0) {
                        fetchSuggestions(topicInput, newLog.subject);
                      } else {
                        // 空の場合でも科目が選択されていれば候補を表示
                        if (newLog.subject) {
                          fetchSuggestions('', newLog.subject);
                        }
                      }
                    }}
                    onBlur={() => {
                      // 少し遅延させて候補選択処理を完了できるようにする
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className='w-full input-primary'
                    placeholder='学習項目を入力 (例: SQL基礎)'
                    autoComplete='off'
                  />
                  
                  {/* 候補リスト */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className='absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto'>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type='button'
                          onClick={() => selectSuggestion(suggestion)}
                          className='w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 last:border-b-0'
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type='button'
                  onClick={addTopic}
                  className='btn-secondary hover-lift click-shrink focus-ring'
                >
                  追加
                </button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {newLog.topics.map((topic, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center badge-info'
                  >
                    {topic}
                    <button
                      type='button'
                      onClick={() => removeTopic(index)}
                      className='ml-2 text-blue-600 hover:text-blue-800'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {newLog.topics.length === 0 && (
                <p className='text-sm text-red-500 mt-1'>最低1つの学習項目を追加してください</p>
              )}
            </div>

            <div>
              <label className='label-primary'>メモ</label>
              <textarea
                value={newLog.memo}
                onChange={e => setNewLog({ ...newLog, memo: e.target.value })}
                rows={3}
                className='input-primary'
                placeholder='学習内容や感想を記録してください'
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

          {/* フィルター・ソートコントロール */}
          <div className='card-secondary p-4 mb-6 hover-lift'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4'>フィルター・ソート</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='label-primary'>科目</label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className='input-primary'
                >
                  <option value=''>すべての科目</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='label-primary'>期間</label>
                <select
                  value={selectedDateRange}
                  onChange={e => setSelectedDateRange(e.target.value as 'all' | 'week' | 'month')}
                  className='input-primary'
                >
                  <option value='all'>すべての期間</option>
                  <option value='week'>過去1週間</option>
                  <option value='month'>過去1ヶ月</option>
                </select>
              </div>
              <div>
                <label className='label-primary'>並び順</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'date' | 'subject' | 'time' | 'understanding')}
                  className='input-primary'
                >
                  <option value='date'>日付順</option>
                  <option value='subject'>科目順</option>
                  <option value='time'>学習時間順</option>
                  <option value='understanding'>理解度順</option>
                </select>
              </div>
            </div>
          </div>

          {(() => {
            const filteredStats = getFilteredStats();
            return (
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                <div className='metric-card hover-lift'>
                  <div className='metric-value text-blue-600'>{filteredStats.count}</div>
                  <div className='metric-label text-blue-800'>記録数</div>
                </div>
                <div className='metric-card hover-lift'>
                  <div className='metric-value text-green-600'>
                    {Math.floor(filteredStats.totalTime / 60)}h {filteredStats.totalTime % 60}m
                  </div>
                  <div className='metric-label text-green-800'>総学習時間</div>
                </div>
                <div className='metric-card hover-lift'>
                  <div className='metric-value text-yellow-600'>{filteredStats.avgUnderstanding.toFixed(1)}</div>
                  <div className='metric-label text-yellow-800'>平均理解度</div>
                </div>
                <div className='metric-card hover-lift'>
                  <div className='text-xl font-bold text-purple-600'>
                    {filteredStats.topSubjects.length > 0
                      ? filteredStats.topSubjects[0]?.subject.substring(0, 8)
                      : 'なし'}
                  </div>
                  <div className='metric-label text-purple-800'>最多学習分野</div>
                </div>
              </div>
            );
          })()}

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>学習履歴</h3>
            {(() => {
              const filteredLogs = getFilteredLogs();
              return filteredLogs.length === 0 ? (
                <p className='text-gray-500 dark:text-gray-400 text-center py-8'>
                  {logs.length === 0 ? 'まだ学習記録がありません' : '条件に合う記録がありません'}
                </p>
              ) : (
                <div className='space-y-3'>
                  {filteredLogs.map((log, index) => (
                    <div key={index} className='border rounded-lg p-4 card-accent'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <h4 className='font-medium text-slate-900 dark:text-slate-100'>{log.subject}</h4>
                          <p className='text-sm text-gray-600'>{log.date}</p>
                          <div className='flex flex-wrap gap-1 mt-2'>
                            {Array.isArray(log.topics) && log.topics.map((topic, topicIndex) => (
                              <span
                                key={topicIndex}
                                className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'
                              >
                                {typeof topic === 'string' ? topic : JSON.stringify(topic)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-sm font-medium text-slate-900 dark:text-slate-100'>{log.studyTime}分</div>
                          <div className='flex space-x-1'>
                            {[1, 2, 3, 4, 5].map(rating => (
                              <span
                                key={rating}
                                className={`w-4 h-4 rounded-full text-xs ${
                                  log.understanding >= rating ? 'bg-yellow-400' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {log.memo && <p className='text-sm text-gray-700 bg-white p-2 rounded border'>{log.memo}</p>}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
