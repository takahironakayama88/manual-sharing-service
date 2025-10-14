import { Card } from "@/components/atoms";
import Link from "next/link";

interface StaffActionCardProps {
  staffId: string;
  staffName: string;
  actionType: "unread_manual" | "low_score" | "short_view";
  manualTitle?: string;
  score?: number;
  viewDuration?: number;
  daysAgo: number;
  locale: string;
}

export default function StaffActionCard({
  staffId,
  staffName,
  actionType,
  manualTitle,
  score,
  viewDuration,
  daysAgo,
  locale,
}: StaffActionCardProps) {
  const getActionInfo = () => {
    switch (actionType) {
      case "unread_manual":
        return {
          icon: "📭",
          label: "未読マニュアル",
          bgColor: "bg-orange-50",
          textColor: "text-orange-700",
          borderColor: "border-orange-200",
        };
      case "low_score":
        return {
          icon: "⚠️",
          label: "テスト不合格",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        };
      case "short_view":
        return {
          icon: "⏱️",
          label: "閲覧時間短い",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
        };
    }
  };

  const info = getActionInfo();
  const timeLabel = daysAgo === 0 ? "今日" : `${daysAgo}日前`;

  return (
    <Card padding="md" hover className={`border-l-4 ${info.borderColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{info.icon}</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${info.bgColor} ${info.textColor}`}>
              {info.label}
            </span>
            <span className="text-xs text-gray-500">{timeLabel}</span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">{staffName}</h3>

          {manualTitle && <p className="text-sm text-gray-600 mb-2">対象: {manualTitle}</p>}

          {score !== undefined && (
            <p className="text-sm text-red-600 font-medium">スコア: {score}点</p>
          )}

          {viewDuration !== undefined && (
            <p className="text-sm text-yellow-600 font-medium">閲覧時間: {viewDuration}秒</p>
          )}
        </div>

        <Link
          href={`/${locale}/admin/staff/${staffId}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          詳細 →
        </Link>
      </div>
    </Card>
  );
}
