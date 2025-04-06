
import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { Member, AttendanceStatus } from "@/types/attendance";
import { toast } from "sonner";

interface MarkAttendancePanelProps {
  members: Member[];
  formattedDate: string;
  getAttendanceStatus: (memberId: string) => AttendanceStatus | null;
  getNotes: (memberId: string) => string;
  getExcuse: (memberId: string) => string;
  handleMarkAttendance: (memberId: string, status: AttendanceStatus) => void;
  handleNoteChange: (memberId: string, note: string) => void;
  handleExcuseChange: (memberId: string, excuse: string) => void;
  onOpenModal: (modal: "qr-scanner" | "qr-generator" | "face-scanner") => void;
  navigate: any;
}

const MarkAttendancePanel: React.FC<MarkAttendancePanelProps> = ({
  members,
  formattedDate,
  getAttendanceStatus,
  getNotes,
  getExcuse,
  handleMarkAttendance,
  handleNoteChange,
  handleExcuseChange,
  onOpenModal,
  navigate
}) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No members in this group yet.</p>
        <Button variant="link" onClick={() => navigate("/members")}>
          Add members to get started
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onOpenModal("qr-scanner")}
          className="flex items-center"
        >
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onOpenModal("qr-generator")}
          className="flex items-center"
        >
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR Code
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onOpenModal("face-scanner")}
          className="flex items-center"
        >
          <Scan className="mr-2 h-4 w-4" />
          Face Recognition
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Excuse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const currentStatus = getAttendanceStatus(member.id);
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={currentStatus === "present" ? "default" : "outline"}
                        className={cn(
                          currentStatus === "present" && "bg-green-500 hover:bg-green-600"
                        )}
                        onClick={() => handleMarkAttendance(member.id, "present")}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={currentStatus === "late" ? "default" : "outline"}
                        className={cn(
                          currentStatus === "late" && "bg-amber-500 hover:bg-amber-600"
                        )}
                        onClick={() => handleMarkAttendance(member.id, "late")}
                      >
                        Late
                      </Button>
                      <Button
                        size="sm"
                        variant={currentStatus === "absent" ? "default" : "outline"}
                        className={cn(
                          currentStatus === "absent" && "bg-red-500 hover:bg-red-600"
                        )}
                        onClick={() => handleMarkAttendance(member.id, "absent")}
                      >
                        Absent
                      </Button>
                      <Button
                        size="sm"
                        variant={currentStatus === "excused" ? "default" : "outline"}
                        className={cn(
                          currentStatus === "excused" && "bg-blue-500 hover:bg-blue-600"
                        )}
                        onClick={() => handleMarkAttendance(member.id, "excused")}
                      >
                        Excused
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <Textarea
                      placeholder="Optional notes..."
                      className="min-h-[60px]"
                      value={getNotes(member.id)}
                      onChange={(e) => handleNoteChange(member.id, e.target.value)}
                      onBlur={() => {
                        if (currentStatus) {
                          handleMarkAttendance(member.id, currentStatus);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <Textarea
                      placeholder="Reason for excuse..."
                      className="min-h-[60px]"
                      value={getExcuse(member.id)}
                      onChange={(e) => handleExcuseChange(member.id, e.target.value)}
                      onBlur={() => {
                        if (currentStatus) {
                          handleMarkAttendance(member.id, currentStatus);
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default MarkAttendancePanel;
