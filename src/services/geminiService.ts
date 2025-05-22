import { GoogleGenAI } from "@google/genai";
import mime from "mime";
import { convertToWav } from "../utils/audioUtils";

export interface VoiceConfig {
  voiceName: string;
  temperature: number;
}

export interface GenerateAudioResponse {
  audioUrl?: string;
  text?: string;
  error?: string;
}

export const availableVoices = [
  { id: "Sulafat", name: "スラファト (女性)" },
  { id: "Alphecca", name: "アルフェッカ (女性)" },
  { id: "Amber", name: "アンバー (女性)" },
  { id: "Capella", name: "カペラ (男性)" },
  { id: "Hadar", name: "ハダル (男性)" },
];

export async function generateAudio(
  text: string,
  voiceConfig: VoiceConfig
): Promise<GenerateAudioResponse> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        error:
          "Gemini API キーが設定されていません。.env ファイルを作成し、VITE_GEMINI_API_KEY を設定してください。",
      };
    }

    if (apiKey === "your_api_key_here") {
      return {
        error:
          ".env ファイル内のAPIキーがまだ更新されていません。.env.example を .env にコピーし、実際のAPIキーを設定してください。",
      };
    }

    console.log(
      "テキスト変換中:",
      text.substring(0, 30) + (text.length > 30 ? "..." : "")
    );
    console.log("選択された音声:", voiceConfig.voiceName);
    console.log("温度設定:", voiceConfig.temperature);

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const config = {
      temperature: voiceConfig.temperature,
      responseModalities: ["audio"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceConfig.voiceName,
          },
        },
      },
    };

    const model = "gemini-2.5-flash-preview-tts";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: text,
          },
        ],
      },
    ];

    console.log("APIリクエスト送信中...");
    try {
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      console.log("APIレスポンス受信完了");

      // 変数を初期化
      let audioData = "";
      let mimeType = "";
      let textResponse = "";
      let hasReceivedAudioData = false;
      let finishReason = "";
      let usageMetadata = null;

      for await (const chunk of response) {
        // チャンクの情報をログに記録
        console.log("チャンク受信:", JSON.stringify(chunk, null, 2));

        // usage metadata があれば保存
        if (chunk.usageMetadata) {
          usageMetadata = chunk.usageMetadata;
          console.log(
            "使用メタデータ:",
            JSON.stringify(usageMetadata, null, 2)
          );
        }

        // chunk.candidatesが存在するか確認
        if (!chunk.candidates || chunk.candidates.length === 0) {
          console.log("候補のないチャンクをスキップ");
          continue;
        }

        // finishReason があれば保存
        const candidate = chunk.candidates[0];
        if (candidate.finishReason) {
          finishReason = candidate.finishReason;
          console.log("完了理由:", finishReason);
        }

        // chunk.candidates[0].contentが存在するか確認
        if (!candidate.content) {
          console.log("コンテンツのないチャンクをスキップ");
          continue;
        }

        // chunk.candidates[0].content.partsが存在するか確認
        const parts = candidate.content.parts;
        if (!parts || parts.length === 0) {
          console.log("パーツのないチャンクをスキップ");
          continue;
        }

        for (const part of parts) {
          if (part.inlineData) {
            console.log(
              "音声データを受信: " +
                (part.inlineData.mimeType || "unknown mime type")
            );
            audioData = part.inlineData.data || "";
            mimeType = part.inlineData.mimeType || "";
            hasReceivedAudioData = true;
          } else if (part.text) {
            console.log("テキストレスポンスを受信");
            textResponse += part.text;
          }
        }
      }

      // finishReason が 'OTHER' の場合のエラーハンドリング
      if (finishReason === "OTHER") {
        console.error(
          "APIが音声生成を完了できませんでした。完了理由:",
          finishReason
        );
        let errorMessage = `APIが音声生成を完了できませんでした。完了理由: ${finishReason}。テキストの内容を変更して再試行してください。`;

        // メタデータに基づいて詳細なエラーメッセージを提供
        if (usageMetadata) {
          console.log(
            "トークン使用量:",
            JSON.stringify(usageMetadata, null, 2)
          );
          errorMessage += ` (プロンプトトークン数: ${usageMetadata.promptTokenCount}, 合計トークン数: ${usageMetadata.totalTokenCount})`;
        }

        return { error: errorMessage };
      }

      if (!hasReceivedAudioData || !audioData || !mimeType) {
        console.error("APIから音声データが受信されませんでした");
        return {
          error:
            "音声データを生成できませんでした。テキストの内容を変更して再試行してください。",
        };
      }

      // Base64 データを Uint8Array に変換
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const rawAudioUint8Array = new Uint8Array(byteNumbers);

      // convertToWav を使用して WAV ヘッダーを付与
      const wavBuffer = convertToWav(rawAudioUint8Array, mimeType);
      const byteArray = new Uint8Array(wavBuffer);

      let fileExtension = mime.getExtension(mimeType);
      if (!fileExtension) {
        fileExtension = "wav";
      }

      console.log("Blobオブジェクトを作成: audio/wav");
      console.log("byteArray の長さ:", byteArray.length);
      console.log("byteArray の最初の10バイト:", byteArray.slice(0, 10));
      const blob = new Blob([byteArray], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);
      console.log("音声URL作成完了");

      return {
        audioUrl,
        text: textResponse,
      };
    } catch (apiError) {
      console.error("API呼び出しエラー:", apiError);
      if (apiError instanceof Error) {
        console.error(
          "API呼び出しエラー (詳細):",
          apiError.name,
          apiError.message,
          apiError.stack
        );
      } else {
        console.error("API呼び出しエラー (詳細):", String(apiError));
      }

      // API特有のエラーメッセージを解析して、よりユーザーフレンドリーなメッセージを提供
      let errorMessage = "音声生成中にエラーが発生しました";

      if (apiError instanceof Error) {
        const errorStr = apiError.toString().toLowerCase();

        if (
          errorStr.includes("api key not valid") ||
          errorStr.includes("invalid_argument")
        ) {
          errorMessage =
            "APIキーが無効です。Google AI Studioで有効なAPIキーを取得し、.envファイルに設定してください。";
        } else if (
          errorStr.includes("permission_denied") ||
          errorStr.includes("forbidden")
        ) {
          errorMessage =
            "APIキーに十分な権限がありません。Google AI Studioでキーの権限を確認してください。";
        } else if (
          errorStr.includes("quota") ||
          errorStr.includes("resource_exhausted")
        ) {
          errorMessage =
            "APIの使用量制限に達しました。しばらく待ってから再試行するか、別のAPIキーを使用してください。";
        } else if (errorStr.includes("not_found")) {
          errorMessage =
            "指定されたモデルまたはリソースが見つかりません。サポートされているモデルを使用しているか確認してください。";
        } else {
          errorMessage = `音声生成中にエラーが発生しました: ${apiError.message}`;
        }
      }

      return { error: errorMessage };
    }
  } catch (error) {
    console.error("音声生成エラー:", error);
    return {
      error: `音声生成中にエラーが発生しました: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
