
import jsQR from "jsqr";

// Generate a QR code URL for a given member ID
export const generateMemberQRData = (memberId: string): string => {
  return JSON.stringify({
    type: 'rotc-attendance',
    memberId,
    timestamp: new Date().toISOString()
  });
};

// Get the member ID from a QR code
export const getMemberIdFromQRCode = (
  imageData: ImageData
): string | null => {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      const data = JSON.parse(code.data);
      if (data.type === 'rotc-attendance' && data.memberId) {
        return data.memberId;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing QR code:", error);
    return null;
  }
};

// Helper function to create ImageData from video element
export const createImageData = (video: HTMLVideoElement): ImageData | null => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error("Error creating image data:", error);
    return null;
  }
};
