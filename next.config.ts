import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: {
    // デプロイ時のESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // デプロイ時の型エラーを無視（開発時は型チェック推奨）
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
