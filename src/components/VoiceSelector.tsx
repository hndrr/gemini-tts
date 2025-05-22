import React from 'react';
import { availableVoices } from '../services/geminiService';

interface VoiceSelectorProps {
  selectedVoice: string;
  onChange: (voiceId: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onChange }) => {
  return (
    <div className="mb-4">
      <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-1">
        音声を選択
      </label>
      <select
        id="voice-select"
        value={selectedVoice}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        {availableVoices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelector;