
import * as faceapi from 'face-api.js';

// Path to face-api models
const MODEL_URL = '/models';

// Initialize the face-api models
export const loadFaceRecognitionModels = async (): Promise<boolean> => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    return true;
  } catch (error) {
    console.error("Error loading face recognition models:", error);
    return false;
  }
};

// Detect faces in a video stream
export const detectFaces = async (
  videoElement: HTMLVideoElement
): Promise<faceapi.TinyFaceDetectorOptions | null> => {
  try {
    if (!videoElement) return null;
    
    const options = new faceapi.TinyFaceDetectorOptions();
    const result = await faceapi.detectSingleFace(videoElement, options);
    
    return result ? options : null;
  } catch (error) {
    console.error("Error detecting faces:", error);
    return null;
  }
};

// Compare faces (in a real app, this would match against stored face data)
// For this demo, we'll just detect if a face is present
export const isFacePresent = async (
  videoElement: HTMLVideoElement
): Promise<boolean> => {
  try {
    const result = await faceapi.detectSingleFace(
      videoElement,
      new faceapi.TinyFaceDetectorOptions()
    );
    
    return !!result;
  } catch (error) {
    console.error("Error checking if face is present:", error);
    return false;
  }
};
