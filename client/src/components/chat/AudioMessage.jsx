import React, { useState, useRef, useEffect } from 'react';
import { formatTime } from '../../utils/audioUtils';

const AudioMessage = ({ audioUrl, duration, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(Math.round(audio.duration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div
      className="flex items-center gap-2 p-3 animate-comic-pop"
      style={{
        minWidth: '250px',
        maxWidth: '300px',
        backgroundColor: isOwn ? '#00ffff' : 'white',
        border: '2px solid black',
        borderRadius: '12px',
        boxShadow: '2px 2px 0 black'
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: isOwn ? '#ffff00' : '#ff0000',
          border: '2px solid black',
          boxShadow: '2px 2px 0 black'
        }}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1 space-y-1">
        <div
          className="h-2 rounded-full cursor-pointer"
          onClick={handleProgressClick}
          style={{
            backgroundColor: '#fff5e6',
            border: '2px solid black'
          }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: isOwn ? '#ff0000' : '#0066ff'
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: 'black' }}>
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
          <button
            onClick={cyclePlaybackRate}
            className="text-xs font-black px-2 py-0.5 rounded transition-all hover:scale-105"
            style={{
              backgroundColor: isOwn ? '#ffff00' : '#fff5e6',
              border: '2px solid black',
              boxShadow: '1px 1px 0 black'
            }}
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
