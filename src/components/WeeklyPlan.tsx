'use client';

import React, { useState, useEffect } from 'react';
import { StudyWeek } from '@/data/studyPlan';
import { weeklyPlanTemplates, createStudyDataFromTemplate, type WeeklyPlanTemplate } from '@/data/weeklyPlanTemplates';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface WeeklyPlanProps {
  studyData: StudyWeek[];
  setStudyData: React.Dispatch<React.SetStateAction<StudyWeek[]>>;
}

export default function WeeklyPlan({ studyData, setStudyData }: WeeklyPlanProps) {
  const { userId, isAuthenticated } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showTemplates, setShowTemplates] = useState(studyData.length === 0);
  const [selectedTemplate, setSelectedTemplate] = useState<WeeklyPlanTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ユーザーログイン時に保存されたテンプレートを復元
  useEffect(() => {
    const loadSavedTemplate = async () => {
      if (!isAuthenticated || !userId || studyData.length > 0) return;
      
      try {
        setIsLoading(true);
        const savedTemplate = await apiClient.getWeeklyPlanTemplate(userId);
        
        if (savedTemplate) {
          // 保存された学習計画データを復元
          const studyWeeks = savedTemplate.studyWeeksData || [];
          setStudyData(studyWeeks);
          setShowTemplates(false);
        }
      } catch (error) {
        console.error('テンプレート復元に失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTemplate();
  }, [isAuthenticated, userId, studyData.length, setStudyData]);

  const handleTaskComplete = async (weekIndex: number, dayIndex: number) => {
    const newData = [...studyData];
    const week = newData[weekIndex];
    if (!week) return;

    const task = week.days[dayIndex];
    if (!task) return;

    const isCompleting = !task.completed;

    // ローカル状態を即座に更新
    task.completed = isCompleting;
    if (isCompleting && task.actualTime === 0) {
      task.actualTime = task.estimatedTime;
    }
    setStudyData(newData);

    // バックエンドに進捗を保存
    try {
      await apiClient.updateStudyProgress(week.weekNumber, dayIndex, {
        completed: task.completed,
        actualTime: task.actualTime,
      });
    } catch (error) {
      // 進捗の保存に失敗しました
      // エラー時は元の状態に戻す
      task.completed = !isCompleting;
      if (!task.completed) {
        task.actualTime = 0;
      }
      setStudyData([...newData]);
    }
  };

  const handleTemplateSelect = (template: WeeklyPlanTemplate) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      setIsLoading(true);
      const newStudyData = createStudyDataFromTemplate(selectedTemplate);
      
      // データベースに保存（認証済みユーザーのみ）
      if (isAuthenticated && userId) {
        await apiClient.saveWeeklyPlanTemplate(userId, {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          studyWeeksData: newStudyData,
          estimatedHours: selectedTemplate.estimatedHours,
        });
      }
      
      // ローカル状態を更新（型キャストで緊急対応）
      setStudyData(newStudyData as unknown as StudyWeek[]);
      setSelectedWeek(1);
      setShowTemplates(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('テンプレート保存に失敗:', error);
      // エラーが発生してもローカル状態は更新する（型キャストで緊急対応）
      const newStudyData = createStudyDataFromTemplate(selectedTemplate);
      setStudyData(newStudyData as unknown as StudyWeek[]);
      setSelectedWeek(1);
      setShowTemplates(false);
      setSelectedTemplate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWeekData = studyData.find(week => week.weekNumber === selectedWeek);

  // テンプレート選択画面
  if (showTemplates) {
    return (
      <div className='space-y-6'>
        <div className='card-primary shadow-moderate'>
          <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>学習計画テンプレート選択</h2>
            <p className='text-slate-600 dark:text-slate-400 mt-1'>あなたに最適な学習計画を選択してください</p>
            {isLoading && (
              <div className='mt-2 flex items-center text-blue-600 dark:text-blue-400'>
                <div className='loading-spinner mr-2'></div>
                <span className='text-sm'>テンプレートを処理中...</span>
              </div>
            )}
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {weeklyPlanTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='font-semibold text-slate-900 dark:text-slate-100'>{template.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.difficulty === 'beginner' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : template.difficulty === 'intermediate'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'  
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {template.difficulty === 'beginner' ? '初級' : template.difficulty === 'intermediate' ? '中級' : '上級'}
                    </span>
                  </div>
                  <p className='text-sm text-slate-600 dark:text-slate-400 mb-3'>{template.description}</p>
                  <div className='space-y-1 text-xs text-slate-500 dark:text-slate-500'>
                    <div className='flex justify-between'>
                      <span>期間:</span>
                      <span>{template.duration}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>対象:</span>
                      <span>{template.targetAudience}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>予想学習時間:</span>
                      <span>{template.estimatedHours}時間</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedTemplate && (
              <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-500'>
                <h4 className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                  選択されたテンプレート: {selectedTemplate.name}
                </h4>
                <p className='text-blue-800 dark:text-blue-200 text-sm mb-4'>
                  {selectedTemplate.description}
                </p>
                <div className='flex space-x-3'>
                  <button
                    onClick={handleApplyTemplate}
                    disabled={isLoading}
                    className='btn-primary hover-lift click-shrink disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoading ? '適用中...' : 'このテンプレートを適用'}
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    disabled={isLoading}
                    className='btn-secondary hover-lift click-shrink disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    選択を取り消し
                  </button>
                </div>
              </div>
            )}

            {studyData.length > 0 && (
              <div className='mt-6 pt-6 border-t border-slate-200 dark:border-slate-700'>
                <button
                  onClick={() => setShowTemplates(false)}
                  className='btn-secondary hover-lift click-shrink'
                >
                  既存の学習計画に戻る
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='card-primary shadow-moderate hover-lift'>
        <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>学習計画</h2>
              <p className='text-slate-600 dark:text-slate-400 mt-1'>週別の詳細な学習計画と進捗管理</p>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className='btn-secondary text-sm hover-lift click-shrink'
            >
              テンプレート変更
            </button>
          </div>
        </div>

        <div className='p-6'>
          <div className='flex flex-wrap gap-2 mb-6'>
            {studyData.map(week => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`px-4 py-2 rounded-lg text-sm font-medium hover-lift click-shrink focus-ring ${
                  selectedWeek === week.weekNumber
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                第{week.weekNumber}週
              </button>
            ))}
          </div>

          {selectedWeekData && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2'>
                  第{selectedWeekData.weekNumber}週: {selectedWeekData.title}
                </h3>
                <div className='flex items-center space-x-4 mb-4'>
                  <span className='badge-info'>
                    {selectedWeekData.phase}
                  </span>
                </div>
                <div className='space-y-2 mb-6'>
                  <h4 className='font-medium text-slate-900 dark:text-slate-100'>学習目標:</h4>
                  <ul className='list-disc list-inside space-y-1'>
                    {selectedWeekData.goals.map((goal, index) => (
                      <li key={index} className='text-slate-700 dark:text-slate-300'>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className='space-y-4'>
                {selectedWeekData.days.map((day, dayIndex) => {
                  const weekIndex = studyData.findIndex(w => w.weekNumber === selectedWeek);
                  return (
                    <div
                      key={dayIndex}
                      className={`border rounded-lg p-4 hover-lift ${
                        day.completed 
                          ? 'success-state' 
                          : 'card-secondary'
                      }`}
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-3 mb-2'>
                            <span className='font-medium text-slate-900 dark:text-slate-100'>{day.day}曜日</span>
                            <h4 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>{day.subject}</h4>
                            <button
                              onClick={() => handleTaskComplete(weekIndex, dayIndex)}
                              className={`px-3 py-1 rounded-full text-sm font-medium click-shrink focus-ring ${
                                day.completed
                                  ? 'badge-success'
                                  : 'badge-info hover-lift'
                              }`}
                            >
                              {day.completed ? '完了' : '未完了'}
                            </button>
                          </div>
                          <div className='flex flex-wrap gap-2 mb-3'>
                            {day.topics.map((topic, topicIndex) => (
                              <span
                                key={topicIndex}
                                className='badge-info'
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='text-sm text-slate-600 dark:text-slate-400'>
                        予定時間: {day.estimatedTime}分 | 実際の時間: {day.actualTime}分
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
