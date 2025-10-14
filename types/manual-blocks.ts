/**
 * Manual Block Editor Type Definitions
 * Notion風のBlock Editorで使用する型定義
 */

export type BlockType = "text" | "image" | "video";

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: {
    text: string;
    style?: "normal" | "heading1" | "heading2" | "heading3" | "bullet" | "numbered";
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  content: {
    url: string;
    alt?: string;
    caption?: string;
  };
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  content: {
    url: string;
    caption?: string;
    thumbnail?: string;
  };
}

export type ManualBlock = TextBlock | ImageBlock | VideoBlock;

export interface ManualBlockEditorState {
  blocks: ManualBlock[];
  selectedBlockId: string | null;
}

// AI自動構築のプレビュー型
export interface AIGeneratedBlock {
  type: BlockType;
  content: TextBlock["content"] | ImageBlock["content"] | VideoBlock["content"];
  order: number;
}

export interface AIManualPreview {
  blocks: AIGeneratedBlock[];
  originalText: string;
}
