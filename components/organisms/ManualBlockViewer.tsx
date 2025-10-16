import { ManualBlock } from "@/types";

interface ManualBlockViewerProps {
  blocks: ManualBlock[];
}

export default function ManualBlockViewer({ blocks }: ManualBlockViewerProps) {
  const renderBlock = (block: ManualBlock) => {
    const content = typeof block.content === "string" ? block.content : "";

    switch (block.type) {
      // 新しいブロックタイプ（BlockEditorで作成）
      case "heading1":
        return (
          <h1 key={block.id} className="text-3xl font-bold text-gray-900 mb-4">
            {content}
          </h1>
        );

      case "heading2":
        return (
          <h2 key={block.id} className="text-2xl font-bold text-gray-900 mb-3">
            {content}
          </h2>
        );

      case "heading3":
        return (
          <h3 key={block.id} className="text-xl font-semibold text-gray-900 mb-2">
            {content}
          </h3>
        );

      case "paragraph":
        return (
          <p key={block.id} className="text-base text-gray-700 mb-4 whitespace-pre-wrap">
            {content}
          </p>
        );

      case "bullet_list": {
        const items = content.split("\n").filter((item) => item.trim());
        return (
          <ul key={block.id} className="list-disc list-inside mb-4 space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-base text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        );
      }

      case "numbered_list": {
        const items = content.split("\n").filter((item) => item.trim());
        return (
          <ol key={block.id} className="list-decimal list-inside mb-4 space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-base text-gray-700">
                {item}
              </li>
            ))}
          </ol>
        );
      }

      case "image":
        return content ? (
          <div key={block.id} className="mb-6 flex justify-center">
            <img
              src={content}
              alt="マニュアル画像"
              className="max-w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
        ) : null;

      case "video":
        return content ? (
          <div key={block.id} className="mb-6 flex justify-center">
            <video src={content} controls className="max-w-full h-auto rounded-lg border border-gray-200">
              お使いのブラウザは動画タグをサポートしていません。
            </video>
          </div>
        ) : null;

      // 古いブロックタイプ（後方互換性のため残す）
      case "text": {
        if (typeof block.content === "object" && block.content !== null) {
          const { text, style = "normal" } = block.content as any;

          const textStyles: Record<string, string> = {
            heading1: "text-2xl font-bold text-gray-900 mb-4",
            heading2: "text-xl font-bold text-gray-900 mb-3",
            heading3: "text-lg font-semibold text-gray-900 mb-2",
            normal: "text-base text-gray-700 mb-3",
            bullet: "text-base text-gray-700 mb-2 pl-6 relative before:content-['•'] before:absolute before:left-2",
            numbered: "text-base text-gray-700 mb-2 pl-6 relative before:absolute before:left-2",
          };

          return (
            <div key={block.id} className={textStyles[style]}>
              {text}
            </div>
          );
        }
        return null;
      }

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {blocks.map((block, index) => (
        <div key={block.id || `block-${index}`}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}
