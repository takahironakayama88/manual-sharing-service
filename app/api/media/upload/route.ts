import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // FormDataからファイルを取得
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ファイルが指定されていません" }, { status: 400 });
    }

    console.log("Uploading file:", file.name, "Type:", file.type, "Size:", file.size);

    // ファイルタイプチェック
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (!allowedTypes.includes(file.type)) {
      console.error("Unsupported file type:", file.type);
      return NextResponse.json(
        { error: `サポートされていないファイル形式です: ${file.type}` },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（画像: 50MB、動画: 100MB）
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 100 * 1024 * 1024 : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      const maxSizeMB = Math.floor(maxSize / 1024 / 1024);
      const fileSizeMB = Math.floor(file.size / 1024 / 1024);
      console.error(`File too large: ${fileSizeMB}MB > ${maxSizeMB}MB`);
      return NextResponse.json(
        { error: `ファイルサイズが大きすぎます（最大${maxSizeMB}MB、現在${fileSizeMB}MB）` },
        { status: 400 }
      );
    }

    // ファイル名を生成（タイムスタンプ + オリジナルファイル名）
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedFileName}`;

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from("manual-media")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: "ファイルのアップロードに失敗しました" },
        { status: 500 }
      );
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("manual-media").getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
      type: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: "アップロード中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
