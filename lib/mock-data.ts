import { Manual, ManualBlock, User, Badge as BadgeType } from "@/types";

/**
 * モックデータ
 * 実装確認用のサンプルデータ
 */

// ===== ユーザー =====
export const mockUsers: User[] = [
  {
    id: "1",
    user_id: "staff_001234",
    role: "staff",
    display_name: "田中 太郎",
    language: "ja",
    organization_id: "org_001",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    user_id: "admin_001",
    role: "admin",
    display_name: "管理者 花子",
    language: "ja",
    organization_id: "org_001",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "3",
    user_id: "staff_002",
    role: "staff",
    display_name: "佐藤 次郎",
    language: "ja",
    organization_id: "org_001",
    created_at: "2025-01-05T00:00:00Z",
  },
  {
    id: "4",
    user_id: "staff_003",
    role: "staff",
    display_name: "Nguyễn Văn A",
    language: "vi",
    organization_id: "org_001",
    created_at: "2025-01-03T00:00:00Z",
  },
  {
    id: "5",
    user_id: "staff_004",
    role: "staff",
    display_name: "鈴木 三郎",
    language: "ja",
    organization_id: "org_001",
    created_at: "2025-01-02T00:00:00Z",
  },
  {
    id: "6",
    user_id: "staff_005",
    role: "staff",
    display_name: "Aung San",
    language: "my",
    organization_id: "org_001",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "7",
    user_id: "staff_006",
    role: "staff",
    display_name: "Maria Santos",
    language: "fil",
    organization_id: "org_001",
    created_at: "2025-02-01T00:00:00Z",
  },
  {
    id: "8",
    user_id: "staff_007",
    role: "staff",
    display_name: "Siti Nurhaliza",
    language: "id",
    organization_id: "org_001",
    created_at: "2025-02-05T00:00:00Z",
  },
];

// ===== マニュアル =====
export const mockManuals: Manual[] = [
  {
    id: "manual_001",
    organization_id: "org_001",
    title: "レジ締め作業の手順",
    description: "営業終了後のレジ締め作業の詳細な手順を解説します。",
    category: "operations",
    status: "published",
    view_count: 45,
    blocks: [
      {
        id: "block_001",
        type: "text",
        content: {
          text: "レジ締め作業は、営業終了後に必ず実施する重要な業務です。",
          style: "heading1",
        },
        order: 0,
      },
      {
        id: "block_002",
        type: "text",
        content: {
          text: "1. レジの「締め処理」ボタンを押す",
          style: "numbered",
        },
        order: 1,
      },
      {
        id: "block_003",
        type: "text",
        content: {
          text: "2. 印刷されたレシートと現金を照合する",
          style: "numbered",
        },
        order: 2,
      },
      {
        id: "block_004",
        type: "text",
        content: {
          text: "3. 金庫に現金を保管する",
          style: "numbered",
        },
        order: 3,
      },
    ] as ManualBlock[],
    language: "ja",
    parent_manual_id: null,
    created_by: "2",
    created_at: "2025-01-10T10:00:00Z",
    updated_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "manual_002",
    organization_id: "org_001",
    title: "開店準備の流れ",
    description: "毎朝の開店準備に必要な作業を順序立てて説明します。",
    category: "onboarding",
    status: "published",
    view_count: 32,
    blocks: [
      {
        id: "block_005",
        type: "text",
        content: {
          text: "毎朝の開店準備は以下の順序で行います。",
          style: "normal",
        },
        order: 0,
      },
      {
        id: "block_006",
        type: "text",
        content: {
          text: "照明をすべて点灯する",
          style: "bullet",
        },
        order: 1,
      },
      {
        id: "block_007",
        type: "text",
        content: {
          text: "レジを開き、釣り銭を準備する",
          style: "bullet",
        },
        order: 2,
      },
      {
        id: "block_008",
        type: "text",
        content: {
          text: "入口のドアを開ける",
          style: "bullet",
        },
        order: 3,
      },
    ] as ManualBlock[],
    language: "ja",
    parent_manual_id: null,
    created_by: "2",
    created_at: "2025-01-09T09:00:00Z",
    updated_at: "2025-01-09T09:00:00Z",
  },
  {
    id: "manual_003",
    organization_id: "org_001",
    title: "清掃作業のチェックリスト",
    description: "店舗内の各エリアの清掃手順とチェック項目をまとめています。",
    category: "operations",
    status: "draft",
    view_count: 12,
    blocks: [
      {
        id: "block_009",
        type: "text",
        content: {
          text: "清掃作業チェックリスト",
          style: "heading1",
        },
        order: 0,
      },
      {
        id: "block_010",
        type: "text",
        content: {
          text: "以下のエリアを清掃してください。",
          style: "normal",
        },
        order: 1,
      },
      {
        id: "block_011",
        type: "text",
        content: {
          text: "トイレ（床・便器・洗面台）",
          style: "bullet",
        },
        order: 2,
      },
      {
        id: "block_012",
        type: "text",
        content: {
          text: "客席エリア（テーブル・椅子）",
          style: "bullet",
        },
        order: 3,
      },
      {
        id: "block_013",
        type: "text",
        content: {
          text: "厨房（調理台・コンロ）",
          style: "bullet",
        },
        order: 4,
      },
    ] as ManualBlock[],
    language: "ja",
    parent_manual_id: null,
    created_by: "2",
    created_at: "2025-01-08T14:00:00Z",
    updated_at: "2025-01-08T14:00:00Z",
  },
  {
    id: "manual_004",
    organization_id: "org_001",
    title: "接客の基本マナー",
    description: "お客様対応の基本的なマナーとコミュニケーション方法を学びます。",
    category: "customer_service",
    status: "published",
    view_count: 78,
    blocks: [
      {
        id: "block_014",
        type: "text",
        content: {
          text: "接客の基本",
          style: "heading1",
        },
        order: 0,
      },
      {
        id: "block_015",
        type: "text",
        content: {
          text: "笑顔で挨拶する",
          style: "bullet",
        },
        order: 1,
      },
      {
        id: "block_016",
        type: "text",
        content: {
          text: "お客様の目を見て話す",
          style: "bullet",
        },
        order: 2,
      },
    ] as ManualBlock[],
    language: "ja",
    parent_manual_id: null,
    created_by: "2",
    created_at: "2025-01-07T11:00:00Z",
    updated_at: "2025-01-07T11:00:00Z",
  },
  {
    id: "manual_005",
    organization_id: "org_001",
    title: "火災発生時の対応手順",
    description: "緊急時の避難誘導と初期消火の方法について解説します。",
    category: "safety",
    status: "published",
    view_count: 23,
    blocks: [
      {
        id: "block_017",
        type: "text",
        content: {
          text: "火災発生時の行動",
          style: "heading1",
        },
        order: 0,
      },
      {
        id: "block_018",
        type: "text",
        content: {
          text: "1. 火災報知器を押す",
          style: "numbered",
        },
        order: 1,
      },
      {
        id: "block_019",
        type: "text",
        content: {
          text: "2. 119番通報する",
          style: "numbered",
        },
        order: 2,
      },
      {
        id: "block_020",
        type: "text",
        content: {
          text: "3. お客様を安全に避難誘導する",
          style: "numbered",
        },
        order: 3,
      },
    ] as ManualBlock[],
    language: "ja",
    parent_manual_id: null,
    created_by: "2",
    created_at: "2025-01-06T13:00:00Z",
    updated_at: "2025-01-06T13:00:00Z",
  },
];

// ===== バッジ =====
export const mockBadges: BadgeType[] = [
  {
    id: "badge_001",
    name: "初心者",
    description: "最初のマニュアルを読了",
    icon: "🌱",
    condition: "complete_1_manual",
  },
  {
    id: "badge_002",
    name: "勉強家",
    description: "5つのマニュアルを読了",
    icon: "📚",
    condition: "complete_5_manuals",
  },
  {
    id: "badge_003",
    name: "達人",
    description: "全テストで80点以上を獲得",
    icon: "🏆",
    condition: "all_tests_above_80",
  },
];

// ===== スタッフの追加（ダッシュボード用） =====
export const mockStaffList: User[] = [
  {
    id: "3",
    user_id: "staff_002",
    role: "staff",
    display_name: "佐藤 次郎",
    language: "ja",
    organization_id: "org_001",
    created_at: "2025-01-05T00:00:00Z",
  },
  {
    id: "4",
    user_id: "staff_003",
    role: "staff",
    display_name: "Nguyễn Văn A",
    language: "vi",
    organization_id: "org_001",
    created_at: "2025-01-03T00:00:00Z",
  },
  {
    id: "5",
    user_id: "staff_004",
    role: "staff",
    display_name: "鈴木 三郎",
    language: "ja",
    organization_id: "org_001",
    created_at: "2025-01-02T00:00:00Z",
  },
  {
    id: "6",
    user_id: "staff_005",
    role: "staff",
    display_name: "Aung San",
    language: "my",
    organization_id: "org_001",
    created_at: "2025-01-01T00:00:00Z",
  },
];

// ===== ダッシュボード用のアクションリスト =====
export interface StaffAction {
  staffId: string;
  staffName: string;
  actionType: "unread_manual" | "low_score" | "short_view";
  manualTitle?: string;
  score?: number;
  viewDuration?: number;
  daysAgo: number;
}

export const mockStaffActions: StaffAction[] = [
  {
    staffId: "3",
    staffName: "佐藤 次郎",
    actionType: "unread_manual",
    manualTitle: "レジ締め作業の手順",
    daysAgo: 2,
  },
  {
    staffId: "4",
    staffName: "Nguyễn Văn A",
    actionType: "low_score",
    manualTitle: "開店準備の流れ",
    score: 45,
    daysAgo: 1,
  },
  {
    staffId: "5",
    staffName: "鈴木 三郎",
    actionType: "short_view",
    manualTitle: "清掃作業のチェックリスト",
    viewDuration: 15,
    daysAgo: 0,
  },
  {
    staffId: "6",
    staffName: "Aung San",
    actionType: "unread_manual",
    manualTitle: "開店準備の流れ",
    daysAgo: 3,
  },
];

// ===== 現在のユーザー（モック認証用） =====
export const getCurrentUser = (): User => {
  return mockUsers[0]; // デフォルトでスタッフユーザーを返す
};

export const getCurrentAdmin = (): User => {
  return mockUsers[1]; // 管理者ユーザー
};
