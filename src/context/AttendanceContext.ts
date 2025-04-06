
import { createContext, useContext } from "react";
import { 
  AttendanceStatus, 
  Group, 
  GroupsData, 
  Member, 
  User 
} from "@/types/attendance";

interface AttendanceContextType {
  groups: GroupsData;
  currentGroupId: string | null;
  setCurrentGroupId: (id: string | null) => void;
  setCurrentGroup: (id: string | null) => void; // Alias for setCurrentGroupId
  addGroup: (group: Group) => void;
  updateGroup: (id: string, groupData: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addMember: (groupId: string, member: Member) => void;
  updateMember: (
    groupId: string,
    memberId: string,
    memberData: Partial<Member>
  ) => void;
  deleteMember: (groupId: string, memberId: string) => void;
  recordAttendance: (
    groupId: string,
    memberId: string,
    date: string,
    status: AttendanceStatus
  ) => void;
  markAttendance: (
    groupId: string,
    memberId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string,
    excuse?: string,
    method?: "manual" | "qr" | "face"
  ) => void;
  clearAttendanceData: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

// Create the context with undefined as default value
const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error(
      "useAttendance must be used within an AttendanceProvider"
    );
  }
  return context;
};

export default AttendanceContext;
