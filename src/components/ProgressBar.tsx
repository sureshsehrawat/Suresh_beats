import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (time: number): string => {
  if (!isFinite(time) || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    onSeek(percentage);
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) { // Left mouse button is pressed
      handleClick(e);
    }
  };

  return (
    <div className="progress-container">
      <span className="time-display">{formatTime(currentTime)}</span>
      <div 
        className="progress-bar-container" 
        onClick={handleClick}
        onMouseMove={handleDrag}
      >
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <span className="time-display">{formatTime(duration - currentTime)}</span>
    </div>
  );
};

export default ProgressBar; 