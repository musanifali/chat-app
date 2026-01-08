export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const compressAudio = async (audioBlob) => {
  // For now, we'll just return the blob
  // In production, you might want to use a library like lamejs for MP3 compression
  // or use the Web Audio API for more control over compression
  return audioBlob;
};

export const getAudioDuration = (audioBlob) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      resolve(Math.round(audio.duration));
    };

    audio.onerror = () => {
      reject(new Error('Failed to load audio'));
    };

    audio.src = URL.createObjectURL(audioBlob);
  });
};

export const validateAudioFile = (file) => {
  const validTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid audio format' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Audio file too large (max 5MB)' };
  }

  return { valid: true };
};
