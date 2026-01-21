// Simple 192x192 icon placeholder
// You should replace this with your actual app icon
// For now, this creates a basic SVG icon

export const createAppIcon = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(0, 0, 192, 192);
  
  // Comic burst
  ctx.fillStyle = '#FF0000';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💬', 96, 96);
  
  return canvas;
};
