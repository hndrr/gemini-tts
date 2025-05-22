import React from 'react';

interface TemperatureControlProps {
  temperature: number;
  onChange: (value: number) => void;
}

const TemperatureControl: React.FC<TemperatureControlProps> = ({ 
  temperature, 
  onChange 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="temperature-slider" className="block text-sm font-medium text-gray-700">
          バリエーション (温度)
        </label>
        <span className="text-sm text-gray-500">{temperature.toFixed(1)}</span>
      </div>
      <input
        id="temperature-slider"
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={temperature}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>一貫性 (0.0)</span>
        <span>創造性 (1.0)</span>
      </div>
    </div>
  );
};

export default TemperatureControl;