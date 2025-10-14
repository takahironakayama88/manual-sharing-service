"use client";

import { useRouter, usePathname } from "next/navigation";
import Button from "./Button";

interface BackButtonProps {
  label?: string;
  locale?: string;
}

export default function BackButton({ label = "← 戻る", locale }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    const segments = pathname.split("/");
    const currentLocale = segments[1]; // /[locale]/... の [locale] 部分
    const role = segments[2]; // admin または staff

    // 管理者画面からの場合は管理者のマニュアル一覧へ
    if (role === "admin") {
      router.push(`/${currentLocale}/admin/manuals`);
    } else {
      // スタッフ画面からの場合はスタッフダッシュボードへ
      router.push(`/${currentLocale}/staff`);
    }
  };

  return (
    <Button variant="secondary" fullWidth onClick={handleBack}>
      {label}
    </Button>
  );
}
