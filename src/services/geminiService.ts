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
  { id: "Zephyr", name: "Zephyr (明るい)" },
  { id: "Puck", name: "Puck (陽気な)" },
  { id: "Charon", name: "Charon (情報豊かな)" },
  { id: "Kore", name: "Kore (しっかりした)" },
  { id: "Fenrir", name: "Fenrir (活発な)" },
  { id: "Leda", name: "Leda (若々しい)" },
  { id: "Orus", name: "Orus (しっかりした)" },
  { id: "Aoede", name: "Aoede (軽快な)" },
  { id: "Callirhoe", name: "Callirhoe (気楽な)" },
  { id: "Autonoe", name: "Autonoe (明るい)" },
  { id: "Enceladus", name: "Enceladus (息遣いのある)" },
  { id: "Iapetus", name: "Iapetus (クリアな)" },
  { id: "Umbriel", name: "Umbriel (気楽な)" },
  { id: "Algieba", name: "Algieba (滑らかな)" },
  { id: "Despina", name: "Despina (滑らかな)" },
  { id: "Erinome", name: "Erinome (クリアな)" },
  { id: "Algenib", name: "Algenib (しわがれた)" },
  { id: "Rasalgethi", name: "Rasalgethi (情報豊かな)" },
  { id: "Laomedeia", name: "Laomedeia (陽気な)" },
  { id: "Achernar", name: "Achernar (柔らかい)" },
  { id: "Alnilam", name: "Alnilam (しっかりした)" },
  { id: "Schedar", name: "Schedar (落ち着いた)" },
  { id: "Gacrux", name: "Gacrux (円熟した)" },
  { id: "Pulcherrima", name: "Pulcherrima (前向きな)" },
  { id: "Achird", name: "Achird (親しみやすい)" },
  { id: "Zubenelgenubi", name: "Zubenelgenubi (カジュアルな)" },
  { id: "Vindemiatrix", name: "Vindemiatrix (穏やかな)" },
  { id: "Sadachbia", name: "Sadachbia (活気のある)" },
  { id: "Sadaltager", name: "Sadaltager (知識豊富な)" },
  { id: "Sulafat", name: "Sulafat (あたたかい)" },
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
        // role: "user",
        parts: [
          {
            text: text,
          },
        ],
      },
    ];

    console.log("APIリクエスト送信中...");
    try {
      const response = await ai.models.generateContent({
        model,
        config,
        contents,
      });

      console.log("APIレスポンス受信完了");
      console.log("レスポンスデータ:", response);

      const { data: audioData, mimeType } =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData || {};
      const textResponse =
        response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const finishReason = response.candidates?.[0]?.finishReason;
      const usageMetadata = response.usageMetadata;
      let errorMessage = "";
      // finishReason が 'OTHER' の場合のエラーハンドリング
      if (finishReason === "OTHER") {
        console.error(
          "APIが音声生成を完了できませんでした。完了理由:",
          finishReason
        );
        errorMessage = `APIが音声生成を完了できませんでした。完了理由: ${finishReason}。テキストの内容を変更して再試行してください。`;

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

      if (!audioData || !mimeType) {
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
