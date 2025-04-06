
// Define types for attendance functionality

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  status: AttendanceStatus;
  timestamp: string;
  notes?: string;
  excuse?: string;
  method?: "manual" | "qr" | "face";
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  attendance: {
    [date: string]: AttendanceRecord;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: {
    [memberId: string]: Member;
  };
}

export interface GroupsData {
  [groupId: string]: Group;
}

export type UserRole = "admin" | "commander" | "cadet";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
