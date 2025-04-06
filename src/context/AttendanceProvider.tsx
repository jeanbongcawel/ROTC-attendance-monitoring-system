
import React, { useState, useEffect, ReactNode } from "react";
import AttendanceContext from "./AttendanceContext";
import { AttendanceStatus, Group, GroupsData, Member, User } from "@/types/attendance";

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({
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

  // Enhanced attendance marking function that includes notes, excuse and method
  const markAttendance = (
    groupId: string,
    memberId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string,
    excuse?: string,
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
                    excuse,
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

export default AttendanceProvider;
