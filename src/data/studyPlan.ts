export interface StudyDay {
  day: string
  subject: string
  topics: string[]
  estimatedTime: number
  completed: boolean
  actualTime: number
  understanding: number
  memo?: string
}

export interface StudyWeek {
  weekNumber: number
  title: string
  goals: string[]
  days: StudyDay[]
  phase: string
}

export const studyPlanData: StudyWeek[] = [
  {
    weekNumber: 1,
    title: "基礎固め期",
    phase: "基礎固め期",
    goals: ["基本的な概念理解"],
    days: [
      {
        day: "月",
        subject: "コンピュータの基礎理論",
        topics: ["2進数", "論理演算"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "火",
        subject: "アルゴリズムとデータ構造",
        topics: ["ソート", "探索", "計算量"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "水",
        subject: "ハードウェア基礎",
        topics: ["CPU", "メモリ", "入出力装置"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "木",
        subject: "ソフトウェア基礎",
        topics: ["OS", "ミドルウェア", "ファイルシステム"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "金",
        subject: "午前問題演習",
        topics: ["1-20問", "基礎理論分野"],
        estimatedTime: 120,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
    ],
  },
  {
    weekNumber: 2,
    title: "基礎知識拡張",
    phase: "基礎固め期",
    goals: ["データベース・ネットワーク基礎理解"],
    days: [
      {
        day: "月",
        subject: "データベース基礎",
        topics: ["正規化", "SQL基本", "トランザクション"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "火",
        subject: "ネットワーク基礎",
        topics: ["OSI参照モデル", "TCP/IP", "ルーティング"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "水",
        subject: "セキュリティ基礎",
        topics: ["暗号化", "認証", "アクセス制御"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "木",
        subject: "システム開発技法",
        topics: ["開発手法", "テスト技法", "品質管理"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "金",
        subject: "午前問題演習",
        topics: ["21-40問", "データベース・ネットワーク分野"],
        estimatedTime: 120,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
    ],
  },
  {
    weekNumber: 3,
    title: "応用知識習得",
    phase: "応用知識習得期",
    goals: ["実践的な知識習得"],
    days: [
      {
        day: "月",
        subject: "データベース応用",
        topics: ["パフォーマンス調整", "分散データベース", "NoSQL"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "火",
        subject: "ネットワーク応用",
        topics: ["VPN", "セキュリティ", "無線LAN"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "水",
        subject: "プログラミング言語",
        topics: ["オブジェクト指向", "関数型", "スクリプト言語"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "木",
        subject: "システムアーキテクチャ",
        topics: ["分散システム", "クラウド", "マイクロサービス"],
        estimatedTime: 180,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
      {
        day: "金",
        subject: "午前問題演習",
        topics: ["41-60問", "応用技術分野"],
        estimatedTime: 120,
        completed: false,
        actualTime: 0,
        understanding: 0,
      },
    ],
  },
]

export const testCategories = [
  "基礎理論",
  "アルゴリズム",
  "コンピュータシステム",
  "技術要素",
  "開発技術",
  "プロジェクトマネジメント",
  "サービスマネジメント",
  "システム戦略",
  "経営戦略",
  "企業と法務",
]

export const afternoonQuestionTypes = [
  "経営戦略・情報戦略",
  "プログラミング",
  "データベース",
  "ネットワーク",
  "情報セキュリティ",
  "システム開発",
  "プロジェクトマネジメント",
  "サービスマネジメント",
]