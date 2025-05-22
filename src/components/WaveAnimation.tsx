import React from 'react';

interface WaveAnimationProps {
  isPlaying: boolean;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({ isPlaying }) => {
  const bars = 24;
  
  return (
    <div className="flex items-center justify-center h-16 my-4">
      <div className="flex items-end space-x-1">
        {Array.from({ length: bars }).map((_, i) => {
          const baseHeight = Math.sin((i / bars) * Math.PI) * 100;
          const height = baseHeight * 0.8 + 20;
          
          return (
            <div
              key={i}
              className={`w-1 bg-indigo-600 rounded-t transition-all duration-300 ease-in-out ${
                isPlaying ? 'animate-soundwave' : 'h-1'
              }`}
              style={{
                height: isPlaying ? `${height}%` : '4%',
                animationDelay: `${(i * 0.05).toFixed(2)}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WaveAnimation;