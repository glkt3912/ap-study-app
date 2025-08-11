'use client';

import { useState, useEffect } from 'react';
import { 
  type StudyPlan, 
  CreateStudyPlanRequest,
  StudyPlanProgress, 
  StudyPlanTemplate
} from '../types/api';

interface StudyPlanComponentProps {
  userId?: number;
  initialPlan?: StudyPlan;
  mode: 'create' | 'edit' | 'view';
  onSave?: (_plan: StudyPlan) => void;
  onCancel?: () => void;
}

export default function StudyPlan({ 
  userId = 1, 
  initialPlan, 
  mode = 'create',
  onSave,
  onCancel 
}: StudyPlanComponentProps) {
  const [plan, setPlan] = useState<StudyPlan | null>(initialPlan || null);
  const [formData, setFormData] = useState<CreateStudyPlanRequest>({
    title: initialPlan?.title || '',
    description: initialPlan?.description || '',
    studyPeriodDays: initialPlan?.studyPeriodDays || 90,
    weeklyStudyHours: initialPlan?.weeklyStudyHours || 20,
    dailyStudyHours: initialPlan?.dailyStudyHours || 3,
    learningStyle: initialPlan?.learningStyle || 'visual',
    difficultyPreference: initialPlan?.difficultyPreference || 'medium',
  });
  const [progress, setProgress] = useState<StudyPlanProgress | null>(null);
  const [templates, setTemplates] = useState<StudyPlanTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StudyPlanTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(mode === 'create');

  useEffect(() => {
    if (mode === 'create') {
      loadTemplates();
    }
    if (initialPlan && mode !== 'create') {
      loadProgress();
    }
  }, [initialPlan, mode]); // loadTemplates and loadProgress are stable

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Mock template data for now - replace with actual API call
      const mockTemplates: StudyPlanTemplate[] = [
        {
          id: 1,
          name: '初心者向け基礎プラン',
          description: '基本的な学習項目を3ヶ月でカバーする初心者向けプラン',
          defaultPeriodDays: 90,
          defaultWeeklyHours: 15,
          targetAudience: '初心者・基礎から学習したい方',
          difficulty: 'beginner',
          features: ['基礎重視', '段階的学習', '復習重点'],
          isPopular: true,
        },
        {
          id: 2,
          name: '集中学習プラン',
          description: '短期間で効率的に学習する集中型プラン',
          defaultPeriodDays: 60,
          defaultWeeklyHours: 25,
          targetAudience: '短期集中で合格を目指す方',
          difficulty: 'intermediate',
          features: ['高効率', '集中学習', '実践重視'],
          isPopular: true,
        },
        {
          id: 3,
          name: 'じっくり学習プラン',
          description: '余裕を持って着実に実力を身につけるプラン',
          defaultPeriodDays: 180,
          defaultWeeklyHours: 12,
          targetAudience: '時間をかけて確実に学習したい方',
          difficulty: 'beginner',
          features: ['ゆとりあり', '確実性重視', '復習充実'],
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

  const loadProgress = async () => {
    if (!initialPlan) return;
    
    try {
      setLoading(true);
      // Mock progress data - replace with actual API call
      const mockProgress: StudyPlanProgress = {
        planId: initialPlan.id,
        totalDays: initialPlan.studyPeriodDays,
        completedDays: Math.floor(initialPlan.studyPeriodDays * initialPlan.progressPercentage / 100),
        totalHours: initialPlan.studyPeriodDays * initialPlan.dailyStudyHours,
        completedHours: Math.floor(
          initialPlan.studyPeriodDays * initialPlan.dailyStudyHours * initialPlan.progressPercentage / 100
        ),
        averageScore: initialPlan.achievementRate,
        streakDays: 5,
        lastStudyDate: new Date().toISOString(),
        upcomingMilestones: [
          {
            id: 1,
            title: '中間テスト',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isCompleted: false,
            description: '学習進捗の中間確認テスト',
          },
        ],
      };
      setProgress(mockProgress);
    } catch (err) {
      setError('進捗データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateStudyPlanRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template: StudyPlanTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: `${template.name}をベースにした学習プラン`,
      description: template.description,
      studyPeriodDays: template.defaultPeriodDays,
      weeklyStudyHours: template.defaultWeeklyHours,
      dailyStudyHours: Math.ceil(template.defaultWeeklyHours / 7),
      learningStyle: 'visual',
      difficultyPreference: template.difficulty === 'beginner' ? 'easy' : template.difficulty === 'advanced' ? 'hard' : 'medium',
    });
    setShowTemplates(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let savedPlan: StudyPlan;

      if (mode === 'create') {
        if (selectedTemplate) {
          // Create from template
          // Mock API call would use templateId and customization
          savedPlan = {
            id: Math.floor(Math.random() * 1000),
            userId,
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            progressPercentage: 0,
            achievementRate: 0,
          };
        } else {
          // Create new plan
          savedPlan = {
            id: Math.floor(Math.random() * 1000),
            userId,
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            progressPercentage: 0,
            achievementRate: 0,
          };
        }
      } else {
        // Update existing plan
        // Mock API call would use updateRequest
        savedPlan = {
          ...initialPlan!,
          ...formData,
          updatedAt: new Date().toISOString(),
        };
      }

      setPlan(savedPlan);
      if (onSave) {
        onSave(savedPlan);
      }
    } catch (err) {
      setError('学習プランの保存に失敗しました');
    } finally {
      setLoading(false);
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

  if (mode === 'view' && plan) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.title}</h2>
            {plan.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-2">{plan.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              閉じる
            </button>
          </div>
        </div>

        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">進捗率</h3>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{plan.progressPercentage}%</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">完了日数</h3>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {progress.completedDays}/{progress.totalDays}日
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">学習時間</h3>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {progress.completedHours}h
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">連続学習</h3>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {progress.streakDays}日
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">プラン詳細</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">学習期間</span>
                <span className="font-medium">{plan.studyPeriodDays}日</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">週間学習時間</span>
                <span className="font-medium">{plan.weeklyStudyHours}時間</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">1日の学習時間</span>
                <span className="font-medium">{plan.dailyStudyHours}時間</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">学習スタイル</span>
                <span className="font-medium">{plan.learningStyle === 'visual' ? '視覚的' : plan.learningStyle === 'auditory' ? '聴覚的' : plan.learningStyle === 'kinesthetic' ? '体験的' : '読書・文章'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">難易度設定</span>
                <span className="font-medium">{plan.difficultyPreference === 'easy' ? '易しい' : plan.difficultyPreference === 'medium' ? '普通' : plan.difficultyPreference === 'hard' ? '難しい' : 'ミックス'}</span>
              </div>
            </div>
          </div>

          {progress?.upcomingMilestones && progress.upcomingMilestones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">今後のマイルストーン</h3>
              <div className="space-y-3">
                {progress.upcomingMilestones.map((milestone) => (
                  <div key={milestone.id} className="p-3 border dark:border-gray-600 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {milestone.description}
            </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(milestone.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'create' ? '新しい学習プラン' : '学習プランの編集'}
        </h2>
        <div className="flex space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      {mode === 'create' && showTemplates && templates.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">テンプレートから選択</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                  {template.isPopular && (
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded">
                      人気
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{template.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div>期間: {template.defaultPeriodDays}日</div>
                  <div>週間学習時間: {template.defaultWeeklyHours}時間</div>
                  <div>対象: {template.targetAudience}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <span key={index} className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              カスタムプランを作成する
            </button>
          </div>
        </div>
      )}

      {(!showTemplates || mode !== 'create') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                プラン名 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                placeholder="例: 応用情報技術者試験対策プラン"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                学習期間（日数） *
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={formData.studyPeriodDays}
                onChange={(e) => handleInputChange('studyPeriodDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              説明
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="プランの詳細や目標を記入してください"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                週間学習時間 *
              </label>
              <input
                type="number"
                min="5"
                max="70"
                value={formData.weeklyStudyHours}
                onChange={(e) => handleInputChange('weeklyStudyHours', parseInt(e.target.value))}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                1日の学習時間 *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={formData.dailyStudyHours}
                onChange={(e) => handleInputChange('dailyStudyHours', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                学習スタイル *
              </label>
              <select
                value={formData.learningStyle}
                onChange={(e) => handleInputChange('learningStyle', e.target.value as any)}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="visual">視覚的（図表・グラフ重視）</option>
                <option value="auditory">聴覚的（音声・説明重視）</option>
                <option value="kinesthetic">体験的（実践・操作重視）</option>
                <option value="reading">読書・文章重視</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                難易度設定 *
              </label>
              <select
                value={formData.difficultyPreference}
                onChange={(e) => handleInputChange('difficultyPreference', e.target.value as any)}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="easy">易しい（基礎中心）</option>
                <option value="medium">普通（標準レベル）</option>
                <option value="hard">難しい（応用・発展）</option>
                <option value="mixed">ミックス（バランス重視）</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            {mode === 'create' && selectedTemplate && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowTemplates(true);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                テンプレートに戻る
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : mode === 'create' ? 'プランを作成' : 'プランを更新'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}