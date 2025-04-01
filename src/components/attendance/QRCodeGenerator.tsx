
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance } from '@/context/AttendanceContext';
import { generateMemberQRData } from '@/utils/qrCodeUtils';

interface QRCodeGeneratorProps {
  onClose: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ onClose }) => {
  const { groups, currentGroupId } = useAttendance();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  const currentGroup = currentGroupId ? groups[currentGroupId] : null;
  const members = currentGroup ? Object.values(currentGroup.members) : [];
  
  useEffect(() => {
    // Select the first member by default if available
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);
  
  useEffect(() => {
    // Generate QR code when member is selected
    if (selectedMemberId) {
      generateQRCode(selectedMemberId);
    }
  }, [selectedMemberId]);
  
  const generateQRCode = async (memberId: string) => {
    try {
      const data = generateMemberQRData(memberId);
      
      // Use a free QR code generation API
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrCodeUrl) {
      const selectedMember = members.find(m => m.id === selectedMemberId);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>ROTC Attendance QR Code - ${selectedMember?.name || 'Member'}</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              h2 { margin-bottom: 5px; }
              p { margin-top: 5px; color: #666; }
              img { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h2>${selectedMember?.name || 'Member'}</h2>
            <p>ROTC Attendance QR Code</p>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p>Scan this code to mark attendance</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generate QR Code</span>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Member</label>
            <Select
              value={selectedMemberId || ''}
              onValueChange={setSelectedMemberId}
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
          
          {qrCodeUrl && (
            <div className="text-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="mx-auto border rounded-md" 
              />
              <p className="mt-2 text-sm text-muted-foreground">
                This QR code contains the unique ID for {members.find(m => m.id === selectedMemberId)?.name}
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handlePrint} disabled={!qrCodeUrl}>
              Print QR Code
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
