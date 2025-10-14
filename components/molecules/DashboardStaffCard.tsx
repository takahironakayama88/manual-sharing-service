import Link from "next/link";
import { User } from "@/types/database";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

interface DashboardStaffCardProps {
  user: User;
  locale: string;
}

export default function DashboardStaffCard({ user, locale }: DashboardStaffCardProps) {
  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      ja: "日本語",
      vi: "ベトナム語",
      my: "ミャンマー語",
      id: "インドネシア語",
      fil: "フィリピン語",
      km: "カンボジア語",
      th: "タイ語",
    };
    return labels[lang] || lang;
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      ja: "🇯🇵",
      vi: "🇻🇳",
      my: "🇲🇲",
      id: "🇮🇩",
      fil: "🇵🇭",
      km: "🇰🇭",
      th: "🇹🇭",
    };
    return flags[lang] || "🌐";
  };

  return (
    <Link href={`/${locale}/admin/staff/${user.id}`}>
      <Card
        padding="md"
        hover
        className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {/* アバター */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user.display_name.charAt(0)}
          </div>

          {/* 名前 */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {user.display_name}
            </h3>
            <p className="text-xs text-gray-500">ID: {user.user_id}</p>
          </div>

          {/* 言語バッジ */}
          <div className="flex items-center gap-1">
            <span className="text-lg">{getLanguageFlag(user.language)}</span>
            <Badge
              variant="blue"
              label={getLanguageLabel(user.language)}
            />
          </div>

          {/* 登録日 */}
          <p className="text-xs text-gray-500">
            📅 {new Date(user.created_at).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </Card>
    </Link>
  );
}
