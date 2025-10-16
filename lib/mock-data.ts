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
export const mockManuals: Manual[] = [];

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
