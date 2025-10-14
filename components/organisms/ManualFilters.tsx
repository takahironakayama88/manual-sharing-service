"use client";

import { useState } from "react";

interface ManualFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
}

export default function ManualFilters({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: ManualFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onCategoryChange(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusChange(value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 検索 */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 マニュアル名で検索..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* カテゴリーフィルター */}
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">すべてのカテゴリー</option>
          <option value="onboarding">オンボーディング</option>
          <option value="operations">業務手順</option>
          <option value="safety">安全管理</option>
          <option value="customer_service">接客</option>
        </select>

        {/* ステータスフィルター */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">すべてのステータス</option>
          <option value="published">公開中</option>
          <option value="draft">下書き</option>
        </select>
      </div>

      {/* アクティブフィルター表示 */}
      {(search || category || status) && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">フィルター中:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
              検索: {search}
              <button
                onClick={() => handleSearchChange("")}
                className="hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
              カテゴリー: {category}
              <button
                onClick={() => handleCategoryChange("")}
                className="hover:text-green-900"
              >
                ✕
              </button>
            </span>
          )}
          {status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md">
              ステータス: {status}
              <button
                onClick={() => handleStatusChange("")}
                className="hover:text-purple-900"
              >
                ✕
              </button>
            </span>
          )}
          <button
            onClick={() => {
              handleSearchChange("");
              handleCategoryChange("");
              handleStatusChange("");
            }}
            className="text-xs text-gray-600 hover:text-gray-900 underline ml-auto"
          >
            すべてクリア
          </button>
        </div>
      )}
    </div>
  );
}
