import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { formatTime } from '../../utils/audioUtils';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VoiceRecorder = ({ onSend, onCancel }) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (audioBlob) {
      setShowPreview(true);
    }
  }, [audioBlob]);

  const handleStart = async () => {
    try {
      setPermissionDenied(false);
      await startRecording();
    } catch (error) {
      console.error('Recording error:', error);
      setPermissionDenied(true);
      toast.error('Microphone access denied. Please enable it in your browser settings.');
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleCancel = () => {
    cancelRecording();
    setShowPreview(false);
    if (onCancel) onCancel();
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      // Upload audio to server
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');

      const response = await api.post('/upload/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { url, duration } = response.data.data;

      // Send message via socket
      onSend(url, 'audio', duration);

      // Reset
      resetRecording();
      setShowPreview(false);
      toast.success('Voice message sent');
    } catch (error) {
      console.error('Send voice message error:', error);
      toast.error('Failed to send voice message');
    } finally {
      setIsUploading(false);
    }
  };

  if (permissionDenied) {
    return (
      <div 
        className="p-4 animate-comic-pop"
        style={{
          backgroundColor: '#ff0000',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black'
        }}
      >
        <p className="text-sm font-bold mb-2" style={{ color: 'white' }}>
          ⚠️ Microphone access is required to send voice messages.
        </p>
        <button 
          onClick={handleCancel} 
          className="text-sm font-black uppercase px-4 py-2 transition-all hover:scale-105"
          style={{
            backgroundColor: 'white',
            color: 'black',
            border: '2px solid black',
            borderRadius: '8px',
            boxShadow: '2px 2px 0 black'
          }}
        >
          CLOSE
        </button>
      </div>
    );
  }

  if (showPreview && audioUrl) {
    return (
      <div 
        className="p-4 space-y-3 animate-comic-pop"
        style={{
          backgroundColor: '#fff5e6',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase">🎤 VOICE MESSAGE PREVIEW</span>
          <span className="text-sm font-bold">{formatTime(recordingTime)}</span>
        </div>

        <audio 
          src={audioUrl} 
          controls 
          className="w-full"
          style={{
            border: '2px solid black',
            borderRadius: '8px'
          }}
        />

        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={isUploading}
            className="flex-1 font-black uppercase py-2 transition-all hover:scale-105"
            style={{
              backgroundColor: isUploading ? '#666' : '#00ff00',
              color: 'black',
              border: '3px solid black',
              borderRadius: '8px',
              boxShadow: '3px 3px 0 black',
              opacity: isUploading ? 0.5 : 1
            }}
          >
            {isUploading ? '⏳ SENDING...' : '⚡ SEND!'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="flex-1 font-black uppercase py-2 transition-all hover:scale-105"
            style={{
              backgroundColor: '#ff0000',
              color: 'white',
              border: '3px solid black',
              borderRadius: '8px',
              boxShadow: '3px 3px 0 black',
              textShadow: '1px 1px 0 black',
              opacity: isUploading ? 0.5 : 1
            }}
          >
            🗑️ DELETE
          </button>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div 
        className="p-4 animate-comic-pop"
        style={{
          backgroundColor: '#ff0000',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-black uppercase" style={{ color: 'white' }}>🎤 RECORDING...</span>
          </div>
          <span className="text-sm font-black" style={{ color: 'white' }}>{formatTime(recordingTime)}</span>
        </div>

        <div 
          className="mb-3 h-12 rounded flex items-center justify-center"
          style={{
            backgroundColor: 'white',
            border: '2px solid black'
          }}
        >
          <div className="flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-black rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="flex-1 font-black uppercase py-2 text-sm transition-all hover:scale-105"
            style={{
              backgroundColor: '#ffff00',
              color: 'black',
              border: '2px solid black',
              borderRadius: '8px',
              boxShadow: '2px 2px 0 black'
            }}
          >
            {isPaused ? '▶️ RESUME' : '⏸️ PAUSE'}
          </button>
          <button 
            onClick={handleStop} 
            className="flex-1 font-black uppercase py-2 text-sm transition-all hover:scale-105"
            style={{
              backgroundColor: '#00ff00',
              color: 'black',
              border: '2px solid black',
              borderRadius: '8px',
              boxShadow: '2px 2px 0 black'
            }}
          >
            ⏹️ STOP
          </button>
          <button 
            onClick={handleCancel} 
            className="font-black uppercase py-2 px-3 text-sm transition-all hover:scale-105"
            style={{
              backgroundColor: 'white',
              color: 'black',
              border: '2px solid black',
              borderRadius: '8px',
              boxShadow: '2px 2px 0 black'
            }}
          >
            ❌
          </button>
        </div>

        {recordingTime >= 110 && (
          <p className="text-xs font-bold mt-2 text-center" style={{ color: 'white' }}>
            ⚠️ Maximum duration: 2 minutes
          </p>
        )}
      </div>
    );
  }

  return (
    <div 
      className="p-4 animate-comic-pop"
      style={{
        backgroundColor: '#fff5e6',
        border: '3px solid black',
        borderRadius: '12px',
        boxShadow: '4px 4px 0 black'
      }}
    >
      <button
        onClick={handleStart}
        className="w-full flex items-center justify-center gap-2 py-3 font-black uppercase transition-all hover:scale-105"
        style={{
          backgroundColor: '#ff0000',
          color: 'white',
          border: '3px solid black',
          borderRadius: '8px',
          boxShadow: '3px 3px 0 black',
          textShadow: '1px 1px 0 black'
        }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>🎤 START RECORDING</span>
      </button>
      <p className="text-xs font-bold mt-2 text-center" style={{ color: '#666' }}>
        Maximum duration: 2 minutes
      </p>
    </div>
  );
};

export default VoiceRecorder;
