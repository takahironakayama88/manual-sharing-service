"use client";

import { useState, useMemo } from "react";
import { Manual } from "@/types/database";
import ManualManagementCard from "@/components/molecules/ManualManagementCard";
import ManualFilters from "@/components/organisms/ManualFilters";
import Button from "@/components/atoms/Button";
import Link from "next/link";

interface ManualListProps {
  manuals: Manual[];
  locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  onDelete?: () => void;
}

export default function ManualList({ manuals, locale, onDelete }: ManualListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // すべてのマニュアルから部署タグを抽出してユニークなリストを作成
  const availableDepartments = useMemo(() => {
    const allDepts = new Set<string>();
    manuals.forEach((manual) => {
      manual.department_tags?.forEach((tag) => allDepts.add(tag));
    });
    return Array.from(allDepts).sort();
  }, [manuals]);

  // フィルタリングされたマニュアル
  const filteredManuals = useMemo(() => {
    return manuals.filter((manual) => {
      // 検索クエリでフィルタリング
      const matchesSearch =
        !searchQuery ||
        manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manual.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // カテゴリーでフィルタリング
      const matchesCategory = !categoryFilter || manual.category === categoryFilter;

      // ステータスでフィルタリング
      const matchesStatus = !statusFilter || manual.status === statusFilter;

      // 部署でフィルタリング
      // 部署タグが空または未設定の場合は「全部署対象」として扱う
      const matchesDepartment =
        !departmentFilter ||
        !manual.department_tags ||
        manual.department_tags.length === 0 ||
        manual.department_tags.includes(departmentFilter);

      return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
    });
  }, [manuals, searchQuery, categoryFilter, statusFilter, departmentFilter]);

  return (
    <div className="space-y-6">
      {/* フィルター・検索セクション */}
      <ManualFilters
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onDepartmentChange={setDepartmentFilter}
        availableDepartments={availableDepartments}
      />

      {/* マニュアル統計 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">総マニュアル数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{manuals.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">公開中</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {manuals.filter((m) => m.status === "published").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">下書き</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {manuals.filter((m) => m.status === "draft").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">表示中</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{filteredManuals.length}</p>
        </div>
      </div>

      {/* マニュアル一覧 */}
      {filteredManuals.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredManuals.length}件のマニュアルを表示中
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredManuals.map((manual) => (
              <ManualManagementCard key={manual.id} manual={manual} locale={locale} onDelete={onDelete} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">
            {manuals.length === 0 ? "マニュアルがありません" : "該当するマニュアルが見つかりません"}
          </p>
          <p className="text-sm text-gray-600 mb-6">
            {manuals.length === 0
              ? "新しいマニュアルを作成して、スタッフの教育を始めましょう"
              : "検索条件を変更するか、フィルターをクリアしてください"}
          </p>
          {manuals.length === 0 ? (
            <Link href={`/${locale}/admin/manuals/new`}>
              <Button variant="primary" size="lg">
                最初のマニュアルを作成
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("");
                setStatusFilter("");
                setDepartmentFilter("");
              }}
            >
              フィルターをクリア
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
