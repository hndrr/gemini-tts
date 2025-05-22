import React, { useState } from 'react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
          テキストを入力
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ここに音声に変換したいテキストを入力してください..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] transition-all duration-200 ease-in-out"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isLoading || !text.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 ease-in-out'
        }`}
      >
        {isLoading ? '生成中...' : '音声を生成'}
      </button>
    </form>
  );
};

export default TextInput;