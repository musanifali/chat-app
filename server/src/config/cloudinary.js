import { v2 as cloudinary } from 'cloudinary';

// Debug: Log environment variables
if (!process.env.CLOUDINARY_API_KEY) {
  console.error('❌ CLOUDINARY_API_KEY is not set!');
  console.error('Environment variables loaded:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING'
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('✅ Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);

export default cloudinary;
