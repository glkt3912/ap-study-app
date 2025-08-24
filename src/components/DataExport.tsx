'use client';

import { useState } from 'react';
import { StudyWeek } from '@/data/studyPlan';
import { apiClient } from '../lib/api';

interface DataExportProps {
  studyData: StudyWeek[];
}

export default function DataExport({ studyData }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  // JSON形式でデータをエクスポート
  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const dataStr = JSON.stringify(studyData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `ap-study-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // JSON エクスポートエラー
    } finally {
      setIsExporting(false);
    }
  };

  // CSV形式でデータをエクスポート
  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const csvHeaders = [
        '週',
        'フェーズ',
        'タイトル',
        '曜日',
        '科目',
        'トピック',
        '予定時間(分)',
        '実際時間(分)',
        '完了',
        '理解度',
        'メモ',
      ].join(',');

      const csvData = studyData
        .flatMap(week =>
          week.days.map(day =>
            [
              week.weekNumber,
              `"${week.phase}"`,
              `"${week.title}"`,
              `"${day.day}"`,
              `"${day.subject}"`,
              `"${day.topics.join('; ')}"`,
              day.estimatedTime,
              day.actualTime,
              day.completed ? '完了' : '未完了',
              day.understanding,
              `"${day.memo || ''}"`,
            ].join(',')
          )
        )
        .join('\n');

      const csvContent = csvHeaders + '\n' + csvData;
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `ap-study-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // CSV エクスポートエラー
    } finally {
      setIsExporting(false);
    }
  };

  // 学習統計データを生成
  const generateStats = () => {
    const totalDays = studyData.reduce((sum, week) => sum + week.days.length, 0);
    const completedDays = studyData.reduce((sum, week) => sum + week.days.filter(day => day.completed).length, 0);
    const totalEstimatedTime = studyData.reduce(
      (sum, week) => sum + week.days.reduce((daySum, day) => daySum + day.estimatedTime, 0),
      0
    );
    const totalActualTime = studyData.reduce(
      (sum, week) => sum + week.days.reduce((daySum, day) => daySum + day.actualTime, 0),
      0
    );
    const averageUnderstanding =
      studyData.reduce((sum, week) => sum + week.days.reduce((daySum, day) => daySum + day.understanding, 0), 0) /
      totalDays;

    return {
      totalDays,
      completedDays,
      completionRate: Math.round((completedDays / totalDays) * 100),
      totalEstimatedTime,
      totalActualTime,
      averageUnderstanding: Math.round(averageUnderstanding * 10) / 10,
      timeEfficiency: totalEstimatedTime > 0 ? Math.round((totalActualTime / totalEstimatedTime) * 100) : 0,
    };
  };

  // Quiz学習データのエクスポート
  const exportQuizData = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      // ユーザーIDを取得（実際の実装では認証コンテキストから取得）
      const userId = 1; // 仮のユーザーID
      const data = await apiClient.exportQuizData(userId, format);

      if (format === 'csv') {
        // CSVの場合はBlobとして返される
        // データを適切なBlob形式に変換
        const blob = new Blob([String(data.data)], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || `quiz-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // JSONの場合は通常の処理
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Quiz データエクスポートエラー
      alert('エクスポートに失敗しました。しばらく待ってから再試行してください。');
    } finally {
      setIsExporting(false);
    }
  };

  const stats = generateStats();

  return (
    <div className='card-primary p-6'>
      <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>📊 データエクスポート</h2>

      {/* 学習統計表示 */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='metric-card hover-lift'>
          <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
            {stats.completedDays}/{stats.totalDays}
          </div>
          <div className='text-sm text-blue-600 dark:text-blue-300'>完了日数</div>
        </div>
        <div className='metric-card hover-lift'>
          <div className='text-2xl font-bold text-green-600 dark:text-green-400'>{stats.completionRate}%</div>
          <div className='text-sm text-green-600 dark:text-green-300'>完了率</div>
        </div>
        <div className='metric-card hover-lift'>
          <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
            {Math.round(stats.totalActualTime / 60)}h
          </div>
          <div className='text-sm text-purple-600 dark:text-purple-300'>学習時間</div>
        </div>
        <div className='metric-card hover-lift'>
          <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{stats.averageUnderstanding}/5</div>
          <div className='text-sm text-orange-600 dark:text-orange-300'>平均理解度</div>
        </div>
      </div>

      {/* エクスポートボタン */}
      <div className='space-y-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>エクスポート形式を選択</h3>

        {/* 学習計画データ */}
        <div>
          <h4 className='text-md font-medium text-gray-800 dark:text-gray-200 mb-3'>📚 学習計画データ</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={exportToJSON}
              disabled={isExporting}
              className='flex items-center justify-center btn-primary hover-lift click-shrink focus-ring interactive-disabled'
            >
              <span className='mr-2'>📄</span>
              JSON形式でエクスポート
            </button>

            <button
              onClick={exportToCSV}
              disabled={isExporting}
              className='flex items-center justify-center btn-success hover-lift click-shrink focus-ring interactive-disabled'
            >
              <span className='mr-2'>📊</span>
              CSV形式でエクスポート
            </button>
          </div>
        </div>

        {/* Quiz学習データ */}
        <div>
          <h4 className='text-md font-medium text-gray-800 dark:text-gray-200 mb-3'>🧠 Quiz学習データ (過去90日分)</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={() => exportQuizData('json')}
              disabled={isExporting}
              className='flex items-center justify-center btn-secondary hover-lift click-shrink focus-ring interactive-disabled'
            >
              <span className='mr-2'>🧠</span>
              Quiz JSON エクスポート
            </button>

            <button
              onClick={() => exportQuizData('csv')}
              disabled={isExporting}
              className='flex items-center justify-center btn-info hover-lift click-shrink focus-ring interactive-disabled'
            >
              <span className='mr-2'>📈</span>
              Quiz CSV エクスポート
            </button>
          </div>
        </div>

        {isExporting && <div className='text-center text-gray-600 dark:text-gray-300'>エクスポート中...</div>}
      </div>

      {/* 使用方法説明 */}
      <div className='mt-8 card-accent'>
        <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>💡 エクスポート機能について</h4>
        <ul className='text-sm text-gray-600 dark:text-gray-300 space-y-1'>
          <li>
            • <strong>学習計画データ</strong>: 週別学習計画と進捗データ
          </li>
          <li>
            • <strong>Quiz学習データ</strong>: 問題演習履歴、正答率、学習分析結果
          </li>
          <li>
            • <strong>JSON形式</strong>: データの完全なバックアップ、他システムでの活用
          </li>
          <li>
            • <strong>CSV形式</strong>: Excel等での分析、表計算ソフトでの管理
          </li>
          <li>• ファイル名には日付が自動で含まれます</li>
          <li>• エクスポートしたデータは個人の学習記録として保管できます</li>
        </ul>
      </div>
    </div>
  );
}
