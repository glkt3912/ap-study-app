'use client'

export default function Analysis() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">学習分析</h2>
          <p className="text-gray-600 mt-1">学習データを分析して効率的な学習方法を見つけましょう</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">学習効率分析</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-800">最も効率的な時間帯</span>
                  <span className="font-medium text-blue-900">午前 (仮)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-800">平均集中時間</span>
                  <span className="font-medium text-blue-900">90分 (仮)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-800">最も理解度の高い分野</span>
                  <span className="font-medium text-blue-900">基礎理論 (仮)</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">進捗予測</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-800">現在の進捗率</span>
                  <span className="font-medium text-green-900">15% (仮)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800">予想合格率</span>
                  <span className="font-medium text-green-900">75% (仮)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800">推奨学習ペース</span>
                  <span className="font-medium text-green-900">2.5h/日 (仮)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">弱点分野と改善提案</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 bg-red-50 p-4">
                <h4 className="font-medium text-red-800">優先度: 高</h4>
                <p className="text-red-700">データベース分野の理解度が低いです。正規化とSQL文の復習を重点的に行いましょう。</p>
                <p className="text-sm text-red-600 mt-2">推奨学習時間: 週4時間</p>
              </div>
              
              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <h4 className="font-medium text-yellow-800">優先度: 中</h4>
                <p className="text-yellow-700">ネットワーク分野の応用問題で苦戦しています。基礎から応用への橋渡しを意識した学習が必要です。</p>
                <p className="text-sm text-yellow-600 mt-2">推奨学習時間: 週3時間</p>
              </div>
              
              <div className="border-l-4 border-green-400 bg-green-50 p-4">
                <h4 className="font-medium text-green-800">優先度: 低</h4>
                <p className="text-green-700">基礎理論分野は順調に理解が進んでいます。現在のペースを維持しましょう。</p>
                <p className="text-sm text-green-600 mt-2">推奨学習時間: 週1時間（復習のみ）</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">学習改善提案</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">📈 効率化のヒント</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 午前中の学習効率が高いため、難しい分野は午前に集中</li>
                  <li>• 90分の集中学習後は15分の休憩を取る</li>
                  <li>• 理解度の低い分野は繰り返し学習を増やす</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">🎯 目標達成のために</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 週末に弱点分野の集中復習を実施</li>
                  <li>• 過去問演習を週3回以上実施</li>
                  <li>• 理解度3以下の分野は重点的に学習</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              ※ このページの分析結果は学習記録データに基づいて表示されます。<br/>
              より正確な分析のために、日々の学習記録を継続してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}