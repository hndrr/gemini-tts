import React, { useState } from "react";

interface TextInputProps {
  onSubmit: (instruction: string, textToSpeak: string) => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit, isLoading }) => {
  const [instruction, setInstruction] = useState("");
  const [textToSpeak, setTextToSpeak] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textToSpeak.trim()) {
      onSubmit(instruction.trim(), textToSpeak.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label
          htmlFor="instruction-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Instruction (オプション)
        </label>
        <textarea
          id="instruction-input"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="音声生成の指示を入力してください（例: 優しい声で、ゆっくりと）"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] transition-all duration-200 ease-in-out mb-4"
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="text-to-speak-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          音声として出力するテキスト <span className="text-red-500">*</span>
        </label>
        <textarea
          id="text-to-speak-input"
          value={textToSpeak}
          onChange={(e) => setTextToSpeak(e.target.value)}
          placeholder="ここに音声に変換したいテキストを入力してください..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] transition-all duration-200 ease-in-out"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !textToSpeak.trim()}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isLoading || !textToSpeak.trim()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 ease-in-out"
        }`}
      >
        {isLoading ? "生成中..." : "音声を生成"}
      </button>
    </form>
  );
};

export default TextInput;
