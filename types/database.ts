/**
 * Database Type Definitions
 * このファイルは `supabase gen types typescript` で生成される型の基本構造です
 * Supabaseプロジェクト作成後に自動生成されたものに置き換えます
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "area_manager" | "staff";
export type Language = "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
export type SubscriptionPlan = "free" | "paid";

// ===== Users & Organizations =====
export interface User {
  id: string;
  user_id: string; // 例: staff_001234
  email?: string; // メールアドレス（オンボーディング後に設定）
  role: UserRole;
  display_name: string;
  language: Language;
  organization_id: string;
  is_admin: boolean; // 管理者権限フラグ
  invite_token?: string; // 招待トークン（オンボーディング前）
  invite_expires_at?: string; // 招待トークン有効期限
  is_onboarded?: boolean; // オンボーディング完了フラグ
  created_at: string;
  updated_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  created_at: string;
}

export interface OnboardingToken {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  used_at: string | null;
}

// ===== Manuals =====
export type BlockType =
  | "heading1"
  | "heading2"
  | "heading3"
  | "paragraph"
  | "bullet_list"
  | "numbered_list"
  | "image"
  | "video";

export interface ManualBlock {
  id: string;
  type: BlockType;
  content: Json;
  order: number;
}

export interface Manual {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  blocks: ManualBlock[];
  category: "onboarding" | "operations" | "safety" | "customer_service";
  status: "published" | "draft";
  is_visible: boolean; // スタッフ画面での表示/非表示
  language: Language;
  parent_manual_id: string | null;
  created_by: string;
  view_count?: number;
  department_tags?: string[]; // 対象部署タグ（例: ["営業部", "製造部"]）。空配列の場合は全部署対象
  created_at: string;
  updated_at: string;
}

// ===== Learning & Testing =====
export interface ManualView {
  id: string;
  manual_id: string;
  user_id: string;
  viewed_at: string;
  view_duration_seconds: number;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface Test {
  id: string;
  manual_id: string;
  questions: TestQuestion[];
  created_at: string;
}

export interface TestResult {
  id: string;
  test_id: string;
  user_id: string;
  score: number;
  answers: Json;
  taken_at: string;
}

// ===== Gamification =====
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

// ===== Database Schema Type =====
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at">;
        Update: Partial<Omit<Organization, "id" | "created_at">>;
      };
      onboarding_tokens: {
        Row: OnboardingToken;
        Insert: Omit<OnboardingToken, "id">;
        Update: Partial<Omit<OnboardingToken, "id">>;
      };
      manuals: {
        Row: Manual;
        Insert: Omit<Manual, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Manual, "id" | "created_at" | "updated_at">>;
      };
      manual_views: {
        Row: ManualView;
        Insert: Omit<ManualView, "id">;
        Update: Partial<Omit<ManualView, "id">>;
      };
      tests: {
        Row: Test;
        Insert: Omit<Test, "id" | "created_at">;
        Update: Partial<Omit<Test, "id" | "created_at">>;
      };
      test_results: {
        Row: TestResult;
        Insert: Omit<TestResult, "id">;
        Update: Partial<Omit<TestResult, "id">>;
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, "id">;
        Update: Partial<Omit<Badge, "id">>;
      };
      user_badges: {
        Row: UserBadge;
        Insert: Omit<UserBadge, "id">;
        Update: Partial<Omit<UserBadge, "id">>;
      };
    };
  };
}
