"use client";

import { useState, useMemo } from "react";
import { User } from "@/types/database";
import StaffCard from "@/components/molecules/StaffCard";
import QRCodeModal from "@/components/organisms/QRCodeModal";

interface StaffListProps {
  users: User[];
  locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  onDelete?: () => void;
}

export default function StaffList({ users, locale, onDelete }: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // フィルタリングされたスタッフ
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 検索クエリでフィルタリング
      const matchesSearch =
        !searchQuery ||
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_id.toLowerCase().includes(searchQuery.toLowerCase());

      // 言語でフィルタリング
      const matchesLanguage = !languageFilter || user.language === languageFilter;

      return matchesSearch && matchesLanguage;
    });
  }, [users, searchQuery, languageFilter]);

  const handleShowQRCode = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseQRCode = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* フィルター・検索セクション */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 スタッフ名またはIDで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* 言語フィルター */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">すべての言語</option>
              <option value="ja">日本語</option>
              <option value="vi">ベトナム語</option>
              <option value="my">ミャンマー語</option>
              <option value="id">インドネシア語</option>
              <option value="fil">フィリピン語</option>
              <option value="km">カンボジア語</option>
              <option value="th">タイ語</option>
            </select>
          </div>

          {/* アクティブフィルター表示 */}
          {(searchQuery || languageFilter) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">フィルター中:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                  検索: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                    ✕
                  </button>
                </span>
              )}
              {languageFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                  言語: {languageFilter}
                  <button onClick={() => setLanguageFilter("")} className="hover:text-green-900">
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setLanguageFilter("");
                }}
                className="text-xs text-gray-600 hover:text-gray-900 underline ml-auto"
              >
                すべてクリア
              </button>
            </div>
          )}
        </div>

        {/* スタッフ統計 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">総スタッフ数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">表示中</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{filteredUsers.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">今月の追加</p>
            <p className="text-2xl font-bold text-green-600 mt-1">2</p>
          </div>
        </div>

        {/* スタッフ一覧 */}
        {filteredUsers.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{filteredUsers.length}名のスタッフを表示中</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <StaffCard key={user.id} user={user} locale={locale} onShowQRCode={handleShowQRCode} onDelete={onDelete} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {users.length === 0 ? "スタッフがいません" : "該当するスタッフが見つかりません"}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              {users.length === 0
                ? "新しいスタッフを追加して、チームを構築しましょう"
                : "検索条件を変更するか、フィルターをクリアしてください"}
            </p>
          </div>
        )}
      </div>

      {/* QRコードモーダル */}
      {selectedUser && (
        <QRCodeModal user={selectedUser} onClose={handleCloseQRCode} locale={locale} />
      )}
    </>
  );
}
