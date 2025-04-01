
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAttendance } from '@/context/AttendanceContext';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLine, AlertCircle } from 'lucide-react';

interface QRCodeScannerProps {
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onClose }) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { groups, currentGroupId, markAttendance } = useAttendance();
  const scannedMembersRef = useRef<Set<string>>(new Set());
  
  const handleScan = useCallback((result: any) => {
    if (result && result.text && currentGroupId) {
      try {
        const data = JSON.parse(result.text);
        
        if (data.type === 'rotc-attendance' && data.memberId) {
          const memberId = data.memberId;
          
          // Check if this member exists in the current group
          const currentGroup = groups[currentGroupId];
          const member = currentGroup?.members[memberId];
          
          if (member && !scannedMembersRef.current.has(memberId)) {
            // Mark attendance as present
            const today = format(new Date(), 'yyyy-MM-dd');
            markAttendance(currentGroupId, memberId, today, 'present', 'Marked via QR Code', 'qr');
            
            // Add to scanned members set to prevent duplicate scans
            scannedMembersRef.current.add(memberId);
            
            toast.success(`Attendance marked for ${member.name}`);
            
            // Stop scanning briefly to prevent multiple scans
            setScanning(false);
            setTimeout(() => setScanning(true), 2000);
          } else if (!member) {
            toast.error('Member not found in current group');
          }
        }
      } catch (err) {
        console.error('Error parsing QR code data:', err);
      }
    }
  }, [currentGroupId, groups, markAttendance]);
  
  const handleError = (err: any) => {
    console.error('QR Code scanner error:', err);
    setError('Error accessing camera. Please ensure you have granted camera permissions.');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QR Code Scanner</span>
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
                setScanning(true);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="relative">
            {scanning && (
              <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={handleScan}
                scanDelay={500}
                containerStyle={{ width: '100%', height: '100%' }}
                videoStyle={{ width: '100%', height: '100%' }}
                onError={handleError}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ScanLine className="h-12 w-12 text-primary animate-pulse" />
            </div>
            {!scanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white text-lg font-medium">Attendance Marked!</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Scan a cadet's QR code to mark attendance as present
          </p>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
