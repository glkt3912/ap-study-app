'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ExamConfig, type CreateExamConfigRequest } from '@/lib/api';

interface ExamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (_config: ExamConfig) => void;
  userId: string;
  initialConfig?: ExamConfig;
}

export function ExamConfigModal({ isOpen, onClose, onSave, userId, initialConfig }: ExamConfigModalProps) {
  const [examDate, setExamDate] = useState('');
  const [targetScore, setTargetScore] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadExistingConfig = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const config = await apiClient.getExamConfig(userId);
      if (config) {
        const dateString = new Date(config.examDate).toISOString().split('T')[0];
        if (dateString) {
          setExamDate(dateString);
        }
        setTargetScore(config.targetScore || 60);
      }
    } catch (_error) {
      // 設定が存在しない場合は新規作成モード（無視）
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        const dateString = new Date(initialConfig.examDate).toISOString().split('T')[0];
        if (dateString) {
          setExamDate(dateString);
        }
        setTargetScore(initialConfig.targetScore || 60);
      } else {
        loadExistingConfig();
      }
    }
  }, [isOpen, initialConfig, loadExistingConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!examDate) {
      setError('試験日を入力してください');
      return;
    }

    const selectedDate = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('試験日は今日以降の日付を選択してください');
      return;
    }

    try {
      setLoading(true);
      const configData: CreateExamConfigRequest = {
        examDate: new Date(examDate).toISOString(),
        targetScore,
      };

      const savedConfig = initialConfig 
        ? await apiClient.updateExamConfig(userId, configData)
        : await apiClient.setExamConfig(userId, configData);

      onSave(savedConfig);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialConfig || !confirm('試験設定を削除してもよろしいですか？')) return;

    try {
      setLoading(true);
      await apiClient.deleteExamConfig(userId);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            試験設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              試験日
            </label>
            <input
              type="date"
              id="examDate"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="targetScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              目標点数
            </label>
            <input
              type="number"
              id="targetScore"
              min="0"
              max="100"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>

          <div className="flex justify-between">
            <div>
              {initialConfig && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  削除
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}