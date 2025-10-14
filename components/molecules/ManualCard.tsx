import { Card, Badge } from "@/components/atoms";
import Link from "next/link";

interface ManualCardProps {
  id: string;
  title: string;
  updatedAt: string;
  isNew?: boolean;
  locale: string;
}

export default function ManualCard({ id, title, updatedAt, isNew, locale }: ManualCardProps) {
  const formattedDate = new Date(updatedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/${locale}/staff/manuals/${id}`}>
      <Card hover padding="md" className="mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          {isNew && (
            <Badge variant="warning" size="sm">
              NEW
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
