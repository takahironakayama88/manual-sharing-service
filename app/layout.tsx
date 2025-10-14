import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manual Sharing Service",
  description: "AI搭載マニュアル共有サービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
