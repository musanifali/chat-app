import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'friendchat/images',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1920, height: 1920, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate audio file
    const allowedMimeTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid audio format' });
    }

    // Max 2 minutes = 120 seconds = ~960KB at 64kbps
    const maxSize = 5 * 1024 * 1024; // 5MB to allow for higher quality/longer clips
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'Audio file too large. Max 5MB.' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'friendchat/audio',
          resource_type: 'video', // Cloudinary uses 'video' for audio
          format: 'mp3',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: Math.round(result.duration || 0), // Duration in seconds
        format: result.format,
      },
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ error: error.message });
  }
};
