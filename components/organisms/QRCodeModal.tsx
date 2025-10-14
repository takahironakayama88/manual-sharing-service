"use client";

import { User } from "@/types/database";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/atoms/Button";

interface QRCodeModalProps {
  user: User;
  onClose: () => void;
  locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
}

export default function QRCodeModal({ user, onClose, locale }: QRCodeModalProps) {
  // オンボーディング用URL（実際の環境では本番URLを使用）
  const onboardingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/onboarding?token=${user.id}`;

  const handleDownload = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${user.user_id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>

        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 オンボーディングQRコード</h2>
          <p className="text-sm text-gray-600">スタッフにスキャンしてもらい、初回登録を完了させます</p>
        </div>

        {/* スタッフ情報 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">スタッフ名</p>
          <p className="text-lg font-bold text-gray-900">{user.display_name}</p>
          <p className="text-xs text-gray-500 mt-2">ID: {user.user_id}</p>
        </div>

        {/* QRコード */}
        <div className="flex justify-center mb-6 bg-white p-6 rounded-lg border-2 border-gray-200">
          <QRCodeSVG
            id="qr-code"
            value={onboardingUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium mb-2">📌 使い方</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>このQRコードをスタッフに見せる</li>
            <li>スタッフがスマホでスキャン</li>
            <li>初回登録画面でパスワード設定</li>
            <li>登録完了！すぐにマニュアル閲覧可能</li>
          </ol>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" fullWidth onClick={handlePrint}>
            🖨️ 印刷
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={handleDownload}>
            💾 ダウンロード
          </Button>
        </div>

        {/* URL表示（デバッグ用） */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600 break-all">
          <p className="font-medium mb-1">登録URL:</p>
          <p className="text-gray-500">{onboardingUrl}</p>
        </div>
      </div>
    </div>
  );
}
