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
    if (locale) {
      // 現在の言語のスタッフページに直接遷移
      router.push(`/${locale}/staff`);
    } else {
      // localeが渡されていない場合は、pathnameから抽出して遷移
      const segments = pathname.split("/");
      const currentLocale = segments[1]; // /[locale]/staff/manuals/[id] の [locale] 部分
      router.push(`/${currentLocale}/staff`);
    }
  };

  return (
    <Button variant="secondary" fullWidth onClick={handleBack}>
      {label}
    </Button>
  );
}
