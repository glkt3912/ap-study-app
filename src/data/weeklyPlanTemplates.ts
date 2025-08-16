import { StudyWeek } from '@/types/api';

export interface WeeklyPlanTemplate {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string;
  estimatedHours: number;
  weeks: StudyWeek[];
}

// 学習計画テンプレート定義
export const weeklyPlanTemplates: WeeklyPlanTemplate[] = [
  {
    id: 'beginner-12week',
    name: '初学者向け 12週間プラン',
    description: '基礎から着実に学習する標準プラン',
    duration: '12週間',
    difficulty: 'beginner',
    targetAudience: '初学者・基礎重視',
    estimatedHours: 180, // 15時間/週 × 12週
    weeks: [
      {
        weekNumber: 1,
        title: '基礎理論 - コンピュータの基礎',
        phase: '基礎固め期',
        goals: ['2進数・論理演算の理解', 'データ構造の基礎'],
        days: [
          { day: '月', subject: '基数変換', topics: ['2進数', '16進数', '論理演算'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'データ構造', topics: ['配列', 'スタック', 'キュー'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'アルゴリズム', topics: ['ソート', '探索', '計算量'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'ハードウェア', topics: ['CPU', 'メモリ', '入出力装置'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第1週総復習', '基礎問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 2,
        title: 'ソフトウェア基礎',
        phase: '基礎固め期', 
        goals: ['OS・プログラミング言語の理解', 'ファイルシステムの基礎'],
        days: [
          { day: '月', subject: 'オペレーティングシステム', topics: ['プロセス管理', 'メモリ管理'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'プログラミング言語', topics: ['言語処理系', 'コンパイラ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'ファイルシステム', topics: ['ディレクトリ構造', 'ファイル操作'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'ソフトウェア工学', topics: ['開発手法', 'テスト技法'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第2週総復習', '応用問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 3,
        title: 'ネットワーク基礎',
        phase: '基礎固め期',
        goals: ['TCP/IP基礎理解', 'ネットワーク機器の役割'],
        days: [
          { day: '月', subject: 'TCP/IP', topics: ['IPアドレス', 'サブネット'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'ルーティング', topics: ['ルータ', 'スイッチ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'プロトコル', topics: ['HTTP', 'HTTPS', 'FTP'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'セキュリティ基礎', topics: ['暗号化', 'ファイアウォール'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第3週総復習', 'ネットワーク問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 4,
        title: 'データベース基礎',
        phase: '基礎固め期',
        goals: ['RDB基礎理解', 'SQL基本操作'],
        days: [
          { day: '月', subject: 'データベース設計', topics: ['ER図', '正規化'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'SQL基本', topics: ['SELECT', 'INSERT', 'UPDATE'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'SQL応用', topics: ['JOIN', 'GROUP BY', 'サブクエリ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'トランザクション', topics: ['ACID', 'ロック'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第4週総復習', 'SQL演習'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 5,
        title: 'システム開発技術',
        phase: '応用力向上期',
        goals: ['開発手法の理解', 'プロジェクト管理基礎'],
        days: [
          { day: '月', subject: '開発プロセス', topics: ['ウォーターフォール', 'アジャイル'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'プロジェクト管理', topics: ['WBS', 'ガントチャート'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'テスト技法', topics: ['単体テスト', '結合テスト'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'システム設計', topics: ['アーキテクチャ', 'UML'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第5週総復習', '開発問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 6,
        title: 'セキュリティ技術',
        phase: '応用力向上期',
        goals: ['情報セキュリティ全般', '脅威と対策'],
        days: [
          { day: '月', subject: '暗号技術', topics: ['共通鍵', '公開鍵', 'ハッシュ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '認証技術', topics: ['PKI', 'デジタル証明書'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'ネットワークセキュリティ', topics: ['VPN', 'IDS/IPS'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'セキュリティ対策', topics: ['マルウェア対策', '脆弱性管理'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第6週総復習', 'セキュリティ問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 7,
        title: '経営戦略・企業活動',
        phase: '応用力向上期',
        goals: ['ストラテジ系基礎', '経営分析手法'],
        days: [
          { day: '月', subject: '経営戦略', topics: ['SWOT分析', 'PPM'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'マーケティング', topics: ['4P', '3C分析'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '会計・財務', topics: ['財務諸表', 'ROI', 'ROE'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '法務・監査', topics: ['知的財産権', '個人情報保護'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第7週総復習', '経営問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 8,
        title: 'サービスマネジメント',
        phase: '応用力向上期',
        goals: ['ITIL基礎', 'サービス運用管理'],
        days: [
          { day: '月', subject: 'ITサービスマネジメント', topics: ['ITIL', 'SLA'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'システム監査', topics: ['監査手法', 'リスク評価'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'ファシリティマネジメント', topics: ['データセンター', '設備管理'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'システム運用', topics: ['運用設計', '障害対応'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '復習・問題演習', topics: ['第8週総復習', '運用問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 9,
        title: '午後問題対策(基礎)',
        phase: '応用力向上期',
        goals: ['記述式問題の解法', '時間配分の習得'],
        days: [
          { day: '月', subject: '午後問題解法', topics: ['読解テクニック', '解答の書き方'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'プログラミング', topics: ['擬似言語', 'フローチャート'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'システム設計', topics: ['設計書読解', '設計問題'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'データベース設計', topics: ['ER図問題', 'SQL応用'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '過去問演習', topics: ['第9週過去問', '解答解説'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 10,
        title: '弱点補強期',
        phase: '直前対策期',
        goals: ['苦手分野の克服', '知識の整理'],
        days: [
          { day: '月', subject: '弱点分析', topics: ['模試結果分析', '対策立案'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '重要分野復習', topics: ['頻出分野', '重要公式'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '計算問題強化', topics: ['数学', '統計', 'アルゴリズム'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '暗記項目整理', topics: ['用語', '略語', '数値'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '模擬試験', topics: ['全範囲模擬試験', '時間配分'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 11,
        title: '総仕上げ期',
        phase: '直前対策期',
        goals: ['最終確認', '本番対策'],
        days: [
          { day: '月', subject: '午前対策', topics: ['頻出問題', '最新動向'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '午後対策', topics: ['記述練習', '解答手順'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '過去問総復習', topics: ['直近3年分', '傾向分析'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '直前確認', topics: ['重要ポイント', '忘れやすい項目'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '本番シミュレーション', topics: ['試験環境慣れ', '心構え'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 12,
        title: '試験直前週',
        phase: '直前対策期',
        goals: ['体調管理', '最終点検'],
        days: [
          { day: '月', subject: '要点整理', topics: ['重要事項確認', '公式まとめ'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '軽い復習', topics: ['基礎確認', '用語チェック'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '試験準備', topics: ['持ち物確認', '会場確認'], estimatedTime: 60, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '休養', topics: ['体調管理', '早寝早起き'], estimatedTime: 30, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '試験当日', topics: ['試験実施', '力を発揮'], estimatedTime: 0, completed: false, actualTime: 0, understanding: 0 }
        ]
      }
    ]
  },
  {
    id: 'intensive-8week',
    name: '短期集中 8週間プラン',
    description: '効率重視の集中学習プラン',
    duration: '8週間',
    difficulty: 'intermediate',
    targetAudience: '経験者・短期合格',
    estimatedHours: 240, // 30時間/週 × 8週
    weeks: [
      {
        weekNumber: 1,
        title: '重要分野集中 - テクノロジ系',
        phase: '集中学習期',
        goals: ['重要分野の効率的習得', '過去問演習'],
        days: [
          { day: '月', subject: 'データベース', topics: ['正規化', 'SQL', 'トランザクション'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'ネットワーク', topics: ['TCP/IP', 'ルーティング', 'セキュリティ'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'セキュリティ', topics: ['暗号化', '認証', '脅威対策'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'システム開発', topics: ['設計手法', 'プロジェクト管理'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '過去問演習', topics: ['午前問題', '午後問題'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '模擬試験', topics: ['総合問題', '時間配分練習'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 2,
        title: 'ストラテジ系・マネジメント系',
        phase: '集中学習期',
        goals: ['経営戦略・サービスマネジメント習得'],
        days: [
          { day: '月', subject: '経営戦略', topics: ['SWOT分析', 'PPM', 'マーケティング'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'システム戦略', topics: ['業務プロセス', 'システム化計画'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'プロジェクトマネジメント', topics: ['WBS', 'スケジュール管理'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'ITサービス', topics: ['ITIL', 'SLA', '可用性'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '過去問演習', topics: ['ストラテジ過去問'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '弱点補強', topics: ['理解不足分野の集中学習'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 3,
        title: 'プログラミング・アルゴリズム',
        phase: '集中学習期',
        goals: ['午後問題対策・プログラミング力向上'],
        days: [
          { day: '月', subject: 'アルゴリズム', topics: ['ソート', '探索', 'グラフ理論'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'データ構造', topics: ['木構造', 'ハッシュ', 'スタック・キュー'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '擬似言語', topics: ['フローチャート', '処理手順'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'プログラミング', topics: ['C言語基礎', 'Java基礎'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '午後プログラミング', topics: ['過去問演習', '解法テクニック'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '総合演習', topics: ['プログラミング総合問題'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 4,
        title: 'システム設計・データベース設計',
        phase: '応用期',
        goals: ['設計問題の解法習得'],
        days: [
          { day: '月', subject: 'システム設計', topics: ['アーキテクチャ', '性能設計'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'データベース設計', topics: ['ER図', '物理設計'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'ネットワーク設計', topics: ['構成設計', 'セキュリティ設計'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'システム開発設計', topics: ['詳細設計', 'テスト設計'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '設計問題演習', topics: ['午後設計問題'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '模擬試験', topics: ['設計分野模試'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 5,
        title: '午後問題特訓 - 記述式対策',
        phase: '実践力向上期',
        goals: ['記述問題の解法パターン習得'],
        days: [
          { day: '月', subject: '記述式解法', topics: ['解答の書き方', '要点整理'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'システム開発記述', topics: ['開発工程', '管理手法'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'データベース記述', topics: ['SQL応用', '設計記述'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: 'ネットワーク記述', topics: ['構成記述', 'セキュリティ記述'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '記述問題演習', topics: ['過去問記述問題'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '時間配分練習', topics: ['本番形式練習'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 6,
        title: '総合問題演習・弱点補強',
        phase: '実践力向上期',
        goals: ['総合力向上・弱点克服'],
        days: [
          { day: '月', subject: '弱点分析', topics: ['模試結果分析', '対策計画'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '重点分野復習', topics: ['苦手分野集中学習'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '計算問題強化', topics: ['数学・統計', '性能計算'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '用語・暗記整理', topics: ['重要用語', '数値暗記'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '総合演習', topics: ['全分野総合問題'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '模擬試験', topics: ['本番形式模試'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 7,
        title: '直前対策・最終確認',
        phase: '直前対策期',
        goals: ['最終仕上げ・本番対策'],
        days: [
          { day: '月', subject: '午前対策', topics: ['頻出問題', '最新動向'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '午後対策', topics: ['記述練習', '解答手順'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '過去問総復習', topics: ['直近5年分', '傾向分析'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '重要事項確認', topics: ['公式・用語', '計算手法'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '本番シミュレーション', topics: ['試験環境慣れ'], estimatedTime: 300, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '最終調整', topics: ['体調管理', '心構え'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 8,
        title: '試験週 - 最終準備',
        phase: '試験直前期',
        goals: ['体調管理・最終点検'],
        days: [
          { day: '月', subject: '要点整理', topics: ['重要事項確認', '公式まとめ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '軽い復習', topics: ['基礎確認', '用語チェック'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '試験準備', topics: ['持ち物確認', '会場確認'], estimatedTime: 60, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '休養', topics: ['体調管理', '早寝早起き'], estimatedTime: 30, completed: false, actualTime: 0, understanding: 0 },
          { day: '金', subject: '最終確認', topics: ['重要ポイント確認'], estimatedTime: 60, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '試験当日', topics: ['試験実施', '力を発揮'], estimatedTime: 0, completed: false, actualTime: 0, understanding: 0 }
        ]
      }
    ]
  },
  {
    id: 'balanced-10week',
    name: '社会人向け 10週間プラン', 
    description: '仕事と両立しながら学習',
    duration: '10週間',
    difficulty: 'intermediate',
    targetAudience: '社会人・両立重視',
    estimatedHours: 200, // 20時間/週 × 10週
    weeks: [
      {
        weekNumber: 1,
        title: 'スケジュール調整期',
        phase: '学習習慣化期',
        goals: ['学習リズム確立', '基礎知識確認'],
        days: [
          { day: '月', subject: '学習計画', topics: ['スケジュール作成', '目標設定'], estimatedTime: 60, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '基礎理論復習', topics: ['数学基礎', '論理思考'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'コンピュータシステム', topics: ['ハードウェア', 'ソフトウェア'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習時間', topics: ['弱点確認', '理解度チェック'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末集中学習', topics: ['まとめ学習', '問題演習'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 2,
        title: 'テクノロジ基礎',
        phase: '基礎固め期',
        goals: ['IT技術の基本理解', '用語習得'],
        days: [
          { day: '月', subject: 'アルゴリズム', topics: ['基本概念', 'フローチャート'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'データ構造', topics: ['配列', 'リスト', '木構造'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'プログラミング', topics: ['言語の種類', '基本文法'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習・問題演習', topics: ['基礎問題', '理解度確認'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末まとめ学習', topics: ['重要ポイント整理'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 3,
        title: 'システム構成技術',
        phase: '基礎固め期',
        goals: ['ハードウェア・ソフトウェア理解'],
        days: [
          { day: '月', subject: 'システム構成', topics: ['CPU', 'メモリ', '記憶装置'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'オペレーティングシステム', topics: ['プロセス', 'スケジューリング'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'ファイルシステム', topics: ['ディレクトリ', 'バックアップ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習・問題演習', topics: ['システム問題'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末まとめ学習', topics: ['総合復習'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 4,
        title: 'ネットワーク技術',
        phase: '基礎固め期',
        goals: ['ネットワークの基本理解'],
        days: [
          { day: '月', subject: 'ネットワーク基礎', topics: ['OSI参照モデル', 'TCP/IP'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'IPアドレス', topics: ['サブネット', 'ルーティング'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'プロトコル', topics: ['HTTP', 'DNS', 'DHCP'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習・問題演習', topics: ['ネットワーク問題'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末まとめ学習', topics: ['ネットワーク総合復習'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 5,
        title: 'データベース技術',
        phase: '応用力向上期',
        goals: ['データベース設計・SQL理解'],
        days: [
          { day: '月', subject: 'データベース基礎', topics: ['RDB概念', 'ER図'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'SQL基本', topics: ['SELECT', 'INSERT', 'UPDATE'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'SQL応用', topics: ['JOIN', 'GROUP BY', 'サブクエリ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習・問題演習', topics: ['SQL練習問題'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末まとめ学習', topics: ['データベース総合'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 6,
        title: 'セキュリティ技術',
        phase: '応用力向上期',
        goals: ['情報セキュリティの理解'],
        days: [
          { day: '月', subject: 'セキュリティ基礎', topics: ['脅威', '脆弱性'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '暗号技術', topics: ['共通鍵', '公開鍵', 'ハッシュ'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '認証・アクセス制御', topics: ['PKI', 'デジタル署名'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習・問題演習', topics: ['セキュリティ問題'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末まとめ学習', topics: ['セキュリティ総合'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 7,
        title: 'システム開発技術',
        phase: '応用力向上期',
        goals: ['開発手法・プロジェクト管理'],
        days: [
          { day: '月', subject: '開発手法', topics: ['ウォーターフォール', 'アジャイル'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'プロジェクト管理', topics: ['WBS', 'PERT', 'ガント'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'テスト技法', topics: ['ブラックボックス', 'ホワイトボックス'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習・問題演習', topics: ['開発技術問題'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末まとめ学習', topics: ['開発技術総合'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 8,
        title: 'ストラテジ系・マネジメント系',
        phase: '応用力向上期',
        goals: ['経営戦略・ITサービス理解'],
        days: [
          { day: '月', subject: '経営戦略', topics: ['SWOT', 'PPM', 'バランススコアカード'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: 'ITサービスマネジメント', topics: ['ITIL', 'SLA'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: 'システム監査', topics: ['監査手法', 'リスク評価'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '復習・問題演習', topics: ['経営・監査問題'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '週末まとめ学習', topics: ['ストラテジ・マネジメント総合'], estimatedTime: 180, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 9,
        title: '午後問題対策・弱点補強',
        phase: '実践力向上期',
        goals: ['記述問題対策・弱点克服'],
        days: [
          { day: '月', subject: '弱点分析', topics: ['模試結果分析'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '午後問題解法', topics: ['記述のコツ', '時間配分'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '過去問演習', topics: ['午後問題', '解答練習'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '苦手分野復習', topics: ['重点的な復習'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '模擬試験', topics: ['本番形式練習'], estimatedTime: 240, completed: false, actualTime: 0, understanding: 0 }
        ]
      },
      {
        weekNumber: 10,
        title: '直前対策・最終確認',
        phase: '直前対策期',
        goals: ['総仕上げ・本番準備'],
        days: [
          { day: '月', subject: '重要事項確認', topics: ['公式', '用語', '略語'], estimatedTime: 90, completed: false, actualTime: 0, understanding: 0 },
          { day: '火', subject: '午前問題総復習', topics: ['頻出問題', '最新傾向'], estimatedTime: 120, completed: false, actualTime: 0, understanding: 0 },
          { day: '水', subject: '午後問題総復習', topics: ['記述問題', '解答手順'], estimatedTime: 150, completed: false, actualTime: 0, understanding: 0 },
          { day: '木', subject: '最終調整', topics: ['体調管理', '試験準備'], estimatedTime: 60, completed: false, actualTime: 0, understanding: 0 },
          { day: '土', subject: '試験当日準備', topics: ['持ち物確認', '会場確認'], estimatedTime: 60, completed: false, actualTime: 0, understanding: 0 }
        ]
      }
    ]
  }
];

// テンプレートIDから該当するテンプレートを取得
export function getTemplateById(id: string): WeeklyPlanTemplate | undefined {
  return weeklyPlanTemplates.find(template => template.id === id);
}

// 難易度別テンプレート取得
export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): WeeklyPlanTemplate[] {
  return weeklyPlanTemplates.filter(template => template.difficulty === difficulty);
}

// テンプレートから新しい学習データを生成
export function createStudyDataFromTemplate(template: WeeklyPlanTemplate): StudyWeek[] {
  return template.weeks.map(week => ({
    ...week,
    id: week.weekNumber, // api.tsのStudyWeek型にはidが必要
    progressPercentage: 0,
    totalStudyTime: 0,
    averageUnderstanding: 0,
    days: week.days.map((day, index) => ({
      ...day,
      id: index + 1, // api.tsのStudyDay型にはidが必要
      completed: false,
      actualTime: 0,
      understanding: 0,
      memo: ''
    }))
  }));
}