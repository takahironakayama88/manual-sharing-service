"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlockType, ManualBlock, Manual } from "@/types/database";
import Button from "@/components/atoms/Button";

interface BlockEditorProps {
  locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  initialManual?: Manual;
}

export default function BlockEditor({ locale, initialManual }: BlockEditorProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<ManualBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // マニュアルのメタデータ
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("onboarding");
  const [language, setLanguage] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">(locale);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // 初期データの読み込み（編集モードの場合）
  useEffect(() => {
    if (initialManual) {
      setTitle(initialManual.title);
      setDescription(initialManual.description || "");
      setCategory(initialManual.category);
      setLanguage(initialManual.language as typeof language);
      setBlocks(initialManual.blocks || []);
    }
  }, [initialManual]);

  // ブロックを追加
  const addBlock = (type: BlockType) => {
    const newBlock: ManualBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
  };

  // デフォルトコンテンツを取得
  const getDefaultContent = (type: BlockType): string => {
    switch (type) {
      case "heading1":
      case "heading2":
      case "heading3":
      case "paragraph":
        return "";
      case "bullet_list":
      case "numbered_list":
        return JSON.stringify([""]);
      case "image":
      case "video":
        return "";
      default:
        return "";
    }
  };

  // ブロックを削除
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  // ブロックコンテンツを更新
  const updateBlockContent = (id: string, content: string) => {
    setBlocks(
      blocks.map((block) => (block.id === id ? { ...block, content } : block))
    );
  };

  // ブロックを上に移動
  const moveBlockUp = (index: number) => {
    if (index === 0) return; // 最初のブロックは上に移動できない
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
  };

  // ブロックを下に移動
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return; // 最後のブロックは下に移動できない
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // ブロックタイプのラベルを取得
  const getBlockTypeLabel = (type: BlockType): string => {
    const labels: Record<BlockType, string> = {
      heading1: "見出し1",
      heading2: "見出し2",
      heading3: "見出し3",
      paragraph: "段落",
      bullet_list: "箇条書き",
      numbered_list: "番号付きリスト",
      image: "画像",
      video: "動画",
    };
    return labels[type];
  };

  // ブロックタイプのアイコンを取得
  const getBlockTypeIcon = (type: BlockType): string => {
    const icons: Record<BlockType, string> = {
      heading1: "H1",
      heading2: "H2",
      heading3: "H3",
      paragraph: "¶",
      bullet_list: "•",
      numbered_list: "1.",
      image: "🖼️",
      video: "🎥",
    };
    return icons[type];
  };

  // バリデーション
  const validate = (): boolean => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = "タイトルは必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = (status: "draft" | "published") => {
    if (!validate()) {
      return;
    }

    // 既存のマニュアルを取得
    const existingManuals = JSON.parse(localStorage.getItem("manuals") || "[]");

    // 画像/動画ブロックをフィルタリング（Data URLを含むものは保存しない）
    // Supabase実装時にアップロード機能を追加予定
    const filteredBlocks = blocks.map((block) => {
      if ((block.type === "image" || block.type === "video") &&
          typeof block.content === "string" &&
          block.content.startsWith("data:")) {
        // Data URLの場合は空にする（後でSupabaseにアップロードする予定）
        return { ...block, content: "" };
      }
      return block;
    });

    if (initialManual) {
      // 編集モード: 既存のマニュアルを更新
      const updatedManual = {
        ...initialManual,
        title,
        description,
        category,
        language,
        status,
        blocks: filteredBlocks,
        updated_at: new Date().toISOString(),
      };

      const updatedManuals = existingManuals.map((m: Manual) =>
        m.id === initialManual.id ? updatedManual : m
      );
      localStorage.setItem("manuals", JSON.stringify(updatedManuals));
    } else {
      // 新規作成モード: 新しいマニュアルを作成
      const newManual = {
        id: `manual_${Date.now()}`,
        title,
        description,
        category,
        language,
        status,
        blocks: filteredBlocks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "admin_001",
        view_count: 0,
      };

      localStorage.setItem("manuals", JSON.stringify([...existingManuals, newManual]));
    }

    // マニュアル管理ページにリダイレクト
    router.push(`/${language}/admin/manuals`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 ">
      {/* タイトル入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          マニュアルタイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
          placeholder="例: 新人スタッフ向けオンボーディング"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-lg ${
            errors.title
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* 説明入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          説明（任意）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="マニュアルの概要を入力してください"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* カテゴリーと言語選択 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリー
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="onboarding">オンボーディング</option>
            <option value="operations">業務手順</option>
            <option value="safety">安全管理</option>
            <option value="customer_service">接客・サービス</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            言語
          </label>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as "ja" | "vi" | "my" | "id" | "fil" | "km" | "th")
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ja">日本語</option>
            <option value="vi">ベトナム語</option>
            <option value="my">ミャンマー語</option>
            <option value="id">インドネシア語</option>
            <option value="fil">フィリピン語</option>
            <option value="km">カンボジア語</option>
            <option value="th">タイ語</option>
          </select>
        </div>
      </div>

      <hr className="my-6" />

      {/* ブロックリスト */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">📝</p>
            <p className="text-sm">ブロックを追加してコンテンツを作成しましょう</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className="relative border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex">
                {/* ドラッグハンドル */}
                <button
                  onClick={() =>
                    setActiveBlockId(activeBlockId === block.id ? null : block.id)
                  }
                  className="flex-shrink-0 w-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors cursor-pointer active:bg-gray-100"
                  title="移動メニューを開く"
                >
                  <span className="text-lg">⋮⋮</span>
                </button>

                {/* ブロックコンテンツエリア */}
                <div className="flex-1 p-4">
                  {/* ブロックヘッダー */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {getBlockTypeIcon(block.type)}
                    </span>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                      title="削除"
                    >
                      ✕
                    </button>
                  </div>

                  {/* ブロックコンテンツ */}
                  <BlockContent
                    block={block}
                    onUpdate={(content) => updateBlockContent(block.id, content)}
                  />
                </div>
              </div>

              {/* 移動ボタンメニュー */}
              {activeBlockId === block.id && (
                <div className="absolute left-10 top-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      moveBlockUp(index);
                      setActiveBlockId(null);
                    }}
                    disabled={index === 0}
                    className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-colors ${
                      index === 0
                        ? "text-gray-300 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <span className="text-xl">↑</span>
                    <span className="font-medium">上に移動</span>
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={() => {
                      moveBlockDown(index);
                      setActiveBlockId(null);
                    }}
                    disabled={index === blocks.length - 1}
                    className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-colors ${
                      index === blocks.length - 1
                        ? "text-gray-300 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <span className="text-xl">↓</span>
                    <span className="font-medium">下に移動</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ブロック追加プルダウン */}
      <div>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              addBlock(e.target.value as BlockType);
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer hover:border-gray-400 transition-colors text-base"
        >
          <option value="">➕ ブロックを追加</option>
          <option value="heading1">📄 見出し1</option>
          <option value="heading2">📄 見出し2</option>
          <option value="heading3">📄 見出し3</option>
          <option value="paragraph">¶ 段落</option>
          <option value="bullet_list">• 箇条書き</option>
          <option value="numbered_list">1. 番号付きリスト</option>
          <option value="image">🖼️ 画像</option>
          <option value="video">🎥 動画</option>
        </select>
      </div>

      <hr className="my-6" />

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" fullWidth onClick={() => handleSave("draft")}>
          下書き保存
        </Button>
        <Button variant="primary" fullWidth onClick={() => handleSave("published")}>
          公開する
        </Button>
      </div>
    </div>
  );
}

// ブロックコンテンツコンポーネント
interface BlockContentProps {
  block: ManualBlock;
  onUpdate: (content: string) => void;
}

function BlockContent({ block, onUpdate }: BlockContentProps) {
  const content = typeof block.content === "string" ? block.content : "";

  // ファイルアップロード処理
  const handleFileUpload = (file: File) => {
    // 本番環境ではSupabase Storageにアップロード
    // 今はブラウザのFileReaderでプレビュー用のData URLを生成
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  switch (block.type) {
    case "heading1":
      return (
        <input
          type="text"
          value={content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="見出し1を入力..."
          className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 p-0"
        />
      );

    case "heading2":
      return (
        <input
          type="text"
          value={content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="見出し2を入力..."
          className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 p-0"
        />
      );

    case "heading3":
      return (
        <input
          type="text"
          value={content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="見出し3を入力..."
          className="w-full text-xl font-bold border-none focus:outline-none focus:ring-0 p-0"
        />
      );

    case "paragraph":
      return (
        <textarea
          value={content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="テキストを入力..."
          rows={3}
          className="w-full border-none focus:outline-none focus:ring-0 p-0 resize-none"
        />
      );

    case "bullet_list":
    case "numbered_list":
      return (
        <textarea
          value={content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="各項目を改行で区切って入力..."
          rows={3}
          className="w-full border-none focus:outline-none focus:ring-0 p-0 resize-none"
        />
      );

    case "image":
      return <ImageUpload content={content} onUpdate={onUpdate} onFileUpload={handleFileUpload} />;

    case "video":
      return <VideoUpload content={content} onUpdate={onUpdate} onFileUpload={handleFileUpload} />;

    default:
      return null;
  }
}

// 画像アップロードコンポーネント
interface MediaUploadProps {
  content: string;
  onUpdate: (content: string) => void;
  onFileUpload: (file: File) => void;
}

function ImageUpload({ content, onUpdate, onFileUpload }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* ドラッグ&ドロップエリア */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          id={`image-upload-${content}`}
        />
        <label htmlFor={`image-upload-${content}`} className="cursor-pointer">
          <div className="space-y-2">
            <div className="text-4xl">📸</div>
            <p className="text-sm text-gray-600">
              画像をドラッグ&ドロップ
              <br />
              またはクリックして選択
            </p>
            <p className="text-xs text-gray-400">
              スマホの場合はカメラで撮影 / カメラロールから選択
            </p>
          </div>
        </label>
      </div>

      {/* プレビュー */}
      {content && (
        <div className="relative">
          <img src={content} alt="プレビュー" className="max-w-full h-auto rounded-lg" />
          <button
            onClick={() => onUpdate("")}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// 動画アップロードコンポーネント
function VideoUpload({ content, onUpdate, onFileUpload }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* ドラッグ&ドロップエリア */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          id={`video-upload-${content}`}
        />
        <label htmlFor={`video-upload-${content}`} className="cursor-pointer">
          <div className="space-y-2">
            <div className="text-4xl">🎥</div>
            <p className="text-sm text-gray-600">
              動画をドラッグ&ドロップ
              <br />
              またはクリックして選択
            </p>
            <p className="text-xs text-gray-400">
              スマホの場合はカメラで撮影 / カメラロールから選択
            </p>
          </div>
        </label>
      </div>

      {/* プレビュー */}
      {content && (
        <div className="relative">
          <video src={content} controls className="max-w-full h-auto rounded-lg" />
          <button
            onClick={() => onUpdate("")}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
