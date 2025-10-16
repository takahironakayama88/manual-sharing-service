import Anthropic from "@anthropic-ai/sdk";

/**
 * Anthropic Claude APIクライアント
 * サーバーサイドでのみ使用すること
 */
export function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }

  return new Anthropic({
    apiKey,
  });
}
