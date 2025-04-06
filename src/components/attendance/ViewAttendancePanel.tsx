
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  name: string;
  status: string | null;
  notes: string;
  excuse: string;
  method: string;
}

interface ViewAttendancePanelProps {
  dateAttendance: AttendanceRecord[];
}

const ViewAttendancePanel: React.FC<ViewAttendancePanelProps> = ({ dateAttendance }) => {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "present":
        return "text-green-500 bg-green-50";
      case "absent":
        return "text-red-500 bg-red-50";
      case "late":
        return "text-amber-500 bg-amber-50";
      case "excused":
        return "text-blue-500 bg-blue-50";
      default:
        return "text-gray-400 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "late":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "excused":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  if (dateAttendance.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attendance records for this date.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Excuse</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dateAttendance.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                {record.name}
              </TableCell>
              <TableCell>
                <div className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  getStatusColor(record.status)
                )}>
                  {getStatusIcon(record.status)}
                  <span className="ml-1 capitalize">{record.status}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="capitalize">{record.method || 'manual'}</span>
              </TableCell>
              <TableCell className="max-w-[200px]">
                {record.notes || "-"}
              </TableCell>
              <TableCell className="max-w-[200px]">
                {record.excuse || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ViewAttendancePanel;
