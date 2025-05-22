import { useState } from "react";
import { Volume2 } from "lucide-react";
import TextInput from "./components/TextInput";
import AudioPlayer from "./components/AudioPlayer";
import VoiceSelector from "./components/VoiceSelector";
import TemperatureControl from "./components/TemperatureControl";
import WaveAnimation from "./components/WaveAnimation";
import StatusMessage from "./components/StatusMessage";
import { generateAudio } from "./services/geminiService";

function App() {
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("Sulafat");
  const [temperature, setTemperature] = useState(1.0);

  const handleGenerateAudio = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await generateAudio(text, {
        voiceName: selectedVoice,
        temperature: temperature,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.audioUrl) {
        setAudioUrls((prevUrls) => [...prevUrls, result.audioUrl!]);
        setSuccess("音声が正常に生成されました。");
      } else {
        setError("音声生成に失敗しました。再試行してください。");
      }
    } catch (err) {
      setError(
        `エラーが発生しました: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-white shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center">
          <Volume2 className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-800">
            音声生成アプリ
          </h1>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <TextInput onSubmit={handleGenerateAudio} isLoading={isLoading} />

              {error && <StatusMessage type="error" message={error} />}
              {success && <StatusMessage type="success" message={success} />}

              <WaveAnimation isPlaying={isLoading} />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">設定</h3>
              <VoiceSelector
                selectedVoice={selectedVoice}
                onChange={setSelectedVoice}
              />
              <TemperatureControl
                temperature={temperature}
                onChange={setTemperature}
              />

              <div className="mt-4 text-sm text-gray-500">
                <p className="mb-2">
                  💡 <strong>ヒント:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>長いテキストは小さな段落に分けてください</li>
                  <li>感情表現には句読点と記号を使用してください</li>
                  <li>特殊な発音がある場合はカタカナで表記してください</li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>重要:</strong> このアプリを使用するには、
                  <a
                    href="https://ai.google.dev/"
                    className="text-indigo-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google AI Studio
                  </a>
                  からGemini APIキーを取得し、<code>.env</code>
                  ファイルに設定する必要があります。
                </p>
              </div>
            </div>
          </div>
        </div>

        {audioUrls.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              生成された音声
            </h3>
            <div className="space-y-4">
              {audioUrls.map((url, index) => (
                <AudioPlayer key={index} audioUrl={url} />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-4 text-center text-sm text-gray-500 mt-auto">
        <p>© 2025 音声生成アプリ - Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
}

export default App;
