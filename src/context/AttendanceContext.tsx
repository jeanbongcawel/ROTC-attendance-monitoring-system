
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

// Define types
export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecord {
  status: AttendanceStatus;
  timestamp: string;
  notes?: string;
  method?: "manual" | "qr" | "face";
}

export interface Member {
  id: string;
  name: string;
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

type UserRole = "admin" | "commander" | "cadet";

interface User {
  id: string;
  name: string;
  role: UserRole;
}

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
    method?: "manual" | "qr" | "face"
  ) => void; // Alias for extended recordAttendance
  clearAttendanceData: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

// Create context
const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [groups, setGroups] = useState<GroupsData>(() => {
    try {
      const storedGroups = localStorage.getItem("rotc_attendance_groups");
      return storedGroups ? JSON.parse(storedGroups) : {};
    } catch (error) {
      console.error("Error parsing stored groups from localStorage", error);
      return {};
    }
  });
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("rotc_attendance_groups", JSON.stringify(groups));
  }, [groups]);

  // Alias for setCurrentGroupId to maintain backward compatibility
  const setCurrentGroup = setCurrentGroupId;

  const addGroup = (group: Group) => {
    setGroups((prevGroups) => ({ ...prevGroups, [group.id]: group }));
  };

  const updateGroup = (id: string, groupData: Partial<Group>) => {
    setGroups((prevGroups) => {
      if (prevGroups[id]) {
        return {
          ...prevGroups,
          [id]: { ...prevGroups[id], ...groupData },
        };
      }
      return prevGroups;
    });
  };

  const deleteGroup = (id: string) => {
    setGroups((prevGroups) => {
      const { [id]: deletedGroup, ...remainingGroups } = prevGroups;
      return remainingGroups;
    });
  };

  const addMember = (groupId: string, member: Member) => {
    setGroups((prevGroups) => {
      const group = prevGroups[groupId];
      if (group) {
        return {
          ...prevGroups,
          [groupId]: {
            ...group,
            members: { ...group.members, [member.id]: member },
          },
        };
      }
      return prevGroups;
    });
  };

  const updateMember = (
    groupId: string,
    memberId: string,
    memberData: Partial<Member>
  ) => {
    setGroups((prevGroups) => {
      const group = prevGroups[groupId];
      if (group && group.members[memberId]) {
        return {
          ...prevGroups,
          [groupId]: {
            ...group,
            members: {
              ...group.members,
              [memberId]: { ...group.members[memberId], ...memberData },
            },
          },
        };
      }
      return prevGroups;
    });
  };

  const deleteMember = (groupId: string, memberId: string) => {
    setGroups((prevGroups) => {
      const group = prevGroups[groupId];
      if (group && group.members[memberId]) {
        const { [memberId]: deletedMember, ...remainingMembers } =
          group.members;
        return {
          ...prevGroups,
          [groupId]: { ...group, members: remainingMembers },
        };
      }
      return prevGroups;
    });
  };

  const recordAttendance = (
    groupId: string,
    memberId: string,
    date: string,
    status: AttendanceStatus
  ) => {
    setGroups((prevGroups) => {
      const group = prevGroups[groupId];
      if (group && group.members[memberId]) {
        return {
          ...prevGroups,
          [groupId]: {
            ...group,
            members: {
              ...group.members,
              [memberId]: {
                ...group.members[memberId],
                attendance: {
                  ...group.members[memberId].attendance,
                  [date]: { status, timestamp: new Date().toISOString() },
                },
              },
            },
          },
        };
      }
      return prevGroups;
    });
  };

  // Enhanced attendance marking function that includes notes and method
  const markAttendance = (
    groupId: string,
    memberId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string,
    method: "manual" | "qr" | "face" = "manual"
  ) => {
    setGroups((prevGroups) => {
      const group = prevGroups[groupId];
      if (group && group.members[memberId]) {
        return {
          ...prevGroups,
          [groupId]: {
            ...group,
            members: {
              ...group.members,
              [memberId]: {
                ...group.members[memberId],
                attendance: {
                  ...group.members[memberId].attendance,
                  [date]: { 
                    status, 
                    timestamp: new Date().toISOString(),
                    notes,
                    method
                  },
                },
              },
            },
          },
        };
      }
      return prevGroups;
    });
  };

  const clearAttendanceData = () => {
    setGroups({});
  };

  // Add user state
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("rotc_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Add effect to save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("rotc_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("rotc_user");
    }
  }, [user]);

  return (
    <AttendanceContext.Provider
      value={{
        groups,
        currentGroupId,
        setCurrentGroupId,
        setCurrentGroup,
        addGroup,
        updateGroup,
        deleteGroup,
        addMember,
        updateMember,
        deleteMember,
        recordAttendance,
        markAttendance,
        clearAttendanceData,
        user,
        setUser,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error(
      "useAttendance must be used within an AttendanceProvider"
    );
  }
  return context;
};
