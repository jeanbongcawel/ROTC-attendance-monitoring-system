
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAttendance } from '@/context/AttendanceContext';
import { format } from 'date-fns';
import { loadFaceRecognitionModels, isFacePresent } from '@/utils/faceRecognitionUtils';
import { Camera, AlertCircle, Check, UserX } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FaceScannerProps {
  onClose: () => void;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'failed' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { groups, currentGroupId, markAttendance } = useAttendance();
  
  const currentGroup = currentGroupId ? groups[currentGroupId] : null;
  const members = currentGroup ? Object.values(currentGroup.members) : [];

  // Load face-api models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const loaded = await loadFaceRecognitionModels();
        setIsModelLoaded(loaded);
        if (!loaded) {
          setError('Failed to load face recognition models. Please try again.');
        }
      } catch (err) {
        console.error('Error loading face recognition models:', err);
        setError('Failed to load face recognition models. Please try again.');
      }
    };
    
    loadModels();
    
    // Select the first member by default if available
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
    
    return () => {
      // Clean up video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [members, selectedMemberId]);
  
  // Start the camera
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access the camera. Please make sure you have given permission.');
      return false;
    }
  };
  
  // Start face scanning
  const startScan = async () => {
    if (!selectedMemberId || !currentGroupId) {
      toast.error('Please select a member first');
      return;
    }
    
    setIsScanning(true);
    setScanResult(null);
    
    const cameraStarted = await startCamera();
    if (!cameraStarted) return;
    
    // Wait a bit for the camera to initialize
    setTimeout(async () => {
      if (videoRef.current) {
        try {
          const faceDetected = await isFacePresent(videoRef.current);
          
          if (faceDetected) {
            // Mark attendance
            const today = format(new Date(), 'yyyy-MM-dd');
            markAttendance(
              currentGroupId, 
              selectedMemberId, 
              today, 
              'present', 
              'Marked via Face Recognition', 
              'face'
            );
            
            setScanResult('success');
            const memberName = currentGroup?.members[selectedMemberId]?.name;
            toast.success(`Face recognized! Attendance marked for ${memberName}`);
          } else {
            setScanResult('failed');
            toast.error('No face detected. Please try again.');
          }
        } catch (err) {
          console.error('Error during face detection:', err);
          setError('An error occurred during face detection.');
        } finally {
          setIsScanning(false);
          
          // Stop the camera
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
        }
      }
    }, 2000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Face Recognition</span>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-red-500">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setError(null);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Member</label>
              <Select
                value={selectedMemberId || ''}
                onValueChange={setSelectedMemberId}
                disabled={isScanning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative bg-black/5 rounded-md overflow-hidden aspect-video mb-4">
              {scanResult === 'success' && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3">
                    <Check className="h-12 w-12 text-green-500" />
                  </div>
                </div>
              )}
              
              {scanResult === 'failed' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3">
                    <UserX className="h-12 w-12 text-red-500" />
                  </div>
                </div>
              )}
              
              {!scanResult && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isScanning ? (
                    <p className="text-primary animate-pulse">Scanning...</p>
                  ) : (
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              )}
              
              <video 
                ref={videoRef} 
                className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`}
                muted
                playsInline
              />
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={startScan}
                disabled={!isModelLoaded || isScanning || !selectedMemberId}
              >
                {isScanning ? 'Scanning...' : 'Start Face Scan'}
              </Button>
              
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceScanner;
