import React, { useRef, useState, useEffect } from 'react';
import { Download, Pause, Play } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string | null;
  fileName?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, fileName = 'generated-audio.wav' }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(currentProgress) ? 0 : currentProgress);
    };

    const handleTimeUpdate = () => {
      updateProgress();
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    
    audio.currentTime = percent * audio.duration;
    setProgress(percent * 100);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="w-full mt-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <audio ref={audioRef} src={audioUrl} />

      <div className="flex items-center justify-between mb-2">
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <div className="flex-1 mx-4">
          <div 
            className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div 
              className="absolute h-full bg-indigo-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{formatTime((progress * duration) / 100)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
          title="ダウンロード"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;