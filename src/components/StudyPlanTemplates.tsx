'use client';

import { useState, useEffect } from 'react';
import { StudyPlanTemplate, CreateStudyPlanFromTemplateRequest } from '../types/api';

interface StudyPlanTemplatesProps {
  onSelectTemplate?: (
    _template: StudyPlanTemplate, 
    _customization?: CreateStudyPlanFromTemplateRequest['customization']
  ) => void;
  onCancel?: () => void;
  selectedTemplateId?: number;
}

export default function StudyPlanTemplates({ 
  onSelectTemplate, 
  onCancel,
  selectedTemplateId 
}: StudyPlanTemplatesProps) {
  const [templates, setTemplates] = useState<StudyPlanTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StudyPlanTemplate | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState<CreateStudyPlanFromTemplateRequest['customization']>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [selectedTemplateId, templates]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call - replace with actual API call
      // const response = await fetch('/api/study-plan/templates');
      // const result = await response.json();
      
      // Mock templates data for demonstration
      const mockTemplates: StudyPlanTemplate[] = [
        {
          id: 1,
          name: '初心者向け基礎プラン',
          description: '基本的な学習項目を3ヶ月でカバーする初心者向けプラン。基礎から段階的に学習できるよう構成されています。',
          defaultPeriodDays: 90,
          defaultWeeklyHours: 15,
          targetAudience: '初心者・基礎から学習したい方',
          difficulty: 'beginner',
          features: ['基礎重視', '段階的学習', '復習重点', '理解度確認'],
          isPopular: true,
        },
        {
          id: 2,
          name: '集中学習プラン',
          description: '短期間で効率的に学習する集中型プラン。重要ポイントに絞った効率的な学習を行います。',
          defaultPeriodDays: 60,
          defaultWeeklyHours: 25,
          targetAudience: '短期集中で合格を目指す方',
          difficulty: 'intermediate',
          features: ['高効率', '集中学習', '実践重視', '頻出問題中心'],
          isPopular: true,
        },
        {
          id: 3,
          name: 'じっくり学習プラン',
          description: '余裕を持って着実に実力を身につけるプラン。時間をかけて確実に理解を深めます。',
          defaultPeriodDays: 180,
          defaultWeeklyHours: 12,
          targetAudience: '時間をかけて確実に学習したい方',
          difficulty: 'beginner',
          features: ['ゆとりあり', '確実性重視', '復習充実', '理解深化'],
          isPopular: false,
        },
        {
          id: 4,
          name: '上級者向けプラン',
          description: '既に基礎知識がある方向けの応用・発展問題中心のプラン。高得点を目指します。',
          defaultPeriodDays: 75,
          defaultWeeklyHours: 20,
          targetAudience: 'IT経験者・高得点を目指す方',
          difficulty: 'advanced',
          features: ['応用重視', '発展問題', '高得点対策', '実務応用'],
          isPopular: false,
        },
        {
          id: 5,
          name: '働きながらプラン',
          description: '仕事と両立しながら学習するための現実的なプラン。無理のないペースで継続できます。',
          defaultPeriodDays: 120,
          defaultWeeklyHours: 10,
          targetAudience: '社会人・働きながら学習する方',
          difficulty: 'beginner',
          features: ['無理ないペース', '継続重視', '週末集中', '効率学習'],
          isPopular: true,
        },
        {
          id: 6,
          name: '直前対策プラン',
          description: '試験直前の総仕上げ用プラン。重要ポイントの総復習と予想問題で仕上げます。',
          defaultPeriodDays: 30,
          defaultWeeklyHours: 35,
          targetAudience: '試験直前・総仕上げをしたい方',
          difficulty: 'intermediate',
          features: ['総復習', '予想問題', '弱点克服', '最終確認'],
          isPopular: false,
        },
      ];

      setTemplates(mockTemplates);
    } catch (err) {
      setError('テンプレートの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: StudyPlanTemplate) => {
    setSelectedTemplate(template);
    setCustomization({
      title: `${template.name}をベースにした学習プラン`,
      studyPeriodDays: template.defaultPeriodDays,
      weeklyStudyHours: template.defaultWeeklyHours,
      dailyStudyHours: Math.ceil(template.defaultWeeklyHours / 7),
      learningStyle: 'visual',
      difficultyPreference: template.difficulty === 'beginner' ? 'easy' : template.difficulty === 'advanced' ? 'hard' : 'medium',
    });
  };

  const handleCustomizationChange = (field: keyof NonNullable<CreateStudyPlanFromTemplateRequest['customization']>, value: any) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    if (selectedTemplate && onSelectTemplate) {
      onSelectTemplate(selectedTemplate, showCustomization ? customization : undefined);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50';
      case 'intermediate':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50';
      case 'advanced':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '初級';
      case 'intermediate':
        return '中級';
      case 'advanced':
        return '上級';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 rounded-lg">
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={loadTemplates}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">学習プランテンプレート</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            あなたに合ったテンプレートを選択してください
          </p>
        </div>
        <div className="flex space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      {!selectedTemplate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-500 ${
                template.isPopular 
                  ? 'border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {template.isPopular && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  人気
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}>
                  {getDifficultyLabel(template.difficulty)}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {template.description}
              </p>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex justify-between">
                  <span>学習期間:</span>
                  <span className="font-medium">{template.defaultPeriodDays}日</span>
                </div>
                <div className="flex justify-between">
                  <span>週間学習時間:</span>
                  <span className="font-medium">{template.defaultWeeklyHours}時間</span>
                </div>
                <div className="flex justify-between">
                  <span>1日平均:</span>
                  <span className="font-medium">{Math.ceil(template.defaultWeeklyHours / 7)}時間</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">対象者</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {template.targetAudience}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">特徴</div>
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                このテンプレートを選択
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedTemplate.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← 戻る
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedTemplate.defaultPeriodDays}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">日間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {selectedTemplate.defaultWeeklyHours}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">時間/週</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {Math.ceil(selectedTemplate.defaultWeeklyHours / 7)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">時間/日</div>
              </div>
              <div className="text-center">
                <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                  {getDifficultyLabel(selectedTemplate.difficulty)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">カスタマイズ</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCustomization}
                  onChange={(e) => setShowCustomization(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">詳細設定</span>
              </label>
            </div>

            {showCustomization && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    プラン名
                  </label>
                  <input
                    type="text"
                    value={customization.title || ''}
                    onChange={(e) => handleCustomizationChange('title', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    placeholder="カスタムプラン名"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      学習期間（日）
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="365"
                      value={customization.studyPeriodDays || selectedTemplate.defaultPeriodDays}
                      onChange={(e) => handleCustomizationChange('studyPeriodDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      週間学習時間
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="70"
                      value={customization.weeklyStudyHours || selectedTemplate.defaultWeeklyHours}
                      onChange={(e) => handleCustomizationChange('weeklyStudyHours', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      1日学習時間
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      value={customization.dailyStudyHours || Math.ceil(selectedTemplate.defaultWeeklyHours / 7)}
                      onChange={(e) => handleCustomizationChange('dailyStudyHours', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      学習スタイル
                    </label>
                    <select
                      value={customization.learningStyle || 'visual'}
                      onChange={(e) => handleCustomizationChange('learningStyle', e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    >
                      <option value="visual">視覚的</option>
                      <option value="auditory">聴覚的</option>
                      <option value="kinesthetic">体験的</option>
                      <option value="reading">読書・文章</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      難易度設定
                    </label>
                    <select
                      value={customization.difficultyPreference || (selectedTemplate.difficulty === 'beginner' ? 'easy' : selectedTemplate.difficulty === 'advanced' ? 'hard' : 'medium')}
                      onChange={(e) => handleCustomizationChange('difficultyPreference', e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    >
                      <option value="easy">易しい</option>
                      <option value="medium">普通</option>
                      <option value="hard">難しい</option>
                      <option value="mixed">ミックス</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                このテンプレートを使用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}