
import React, { createContext, useContext, useState, useEffect } from "react";

// Define types for our data structures
export type Attendance = {
  id: string;
  date: string;
  status: "present" | "absent" | "late";
  notes?: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  attendance: Record<string, Attendance>;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  members: Record<string, Member>;
};

type AttendanceContextType = {
  groups: Record<string, Group>;
  currentGroupId: string | null;
  addGroup: (name: string, description?: string) => void;
  updateGroup: (id: string, name: string, description?: string) => void;
  deleteGroup: (id: string) => void;
  setCurrentGroup: (id: string | null) => void;
  addMember: (groupId: string, name: string, email: string) => void;
  updateMember: (groupId: string, memberId: string, name: string, email: string) => void;
  deleteMember: (groupId: string, memberId: string) => void;
  markAttendance: (groupId: string, memberId: string, date: string, status: "present" | "absent" | "late", notes?: string) => void;
  clearAttendanceData: () => void;
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};

// Generate a simple unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedGroups = localStorage.getItem("attendanceGroups");
    const savedCurrentGroup = localStorage.getItem("currentGroupId");
    
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
    
    if (savedCurrentGroup) {
      setCurrentGroupId(savedCurrentGroup);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("attendanceGroups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    if (currentGroupId) {
      localStorage.setItem("currentGroupId", currentGroupId);
    } else {
      localStorage.removeItem("currentGroupId");
    }
  }, [currentGroupId]);

  // Add a new group
  const addGroup = (name: string, description?: string) => {
    const id = generateId();
    setGroups(prev => ({
      ...prev,
      [id]: {
        id,
        name,
        description,
        members: {}
      }
    }));
    if (!currentGroupId) {
      setCurrentGroupId(id);
    }
  };

  // Update an existing group
  const updateGroup = (id: string, name: string, description?: string) => {
    setGroups(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          name,
          description
        }
      };
    });
  };

  // Delete a group
  const deleteGroup = (id: string) => {
    setGroups(prev => {
      const newGroups = { ...prev };
      delete newGroups[id];
      return newGroups;
    });

    if (currentGroupId === id) {
      const remainingGroups = Object.keys(groups).filter(groupId => groupId !== id);
      setCurrentGroupId(remainingGroups.length > 0 ? remainingGroups[0] : null);
    }
  };

  // Set current group
  const setCurrentGroup = (id: string | null) => {
    setCurrentGroupId(id);
  };

  // Add a new member to a group
  const addMember = (groupId: string, name: string, email: string) => {
    setGroups(prev => {
      if (!prev[groupId]) return prev;
      const id = generateId();
      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          members: {
            ...prev[groupId].members,
            [id]: {
              id,
              name,
              email,
              attendance: {}
            }
          }
        }
      };
    });
  };

  // Update an existing member
  const updateMember = (groupId: string, memberId: string, name: string, email: string) => {
    setGroups(prev => {
      if (!prev[groupId] || !prev[groupId].members[memberId]) return prev;
      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          members: {
            ...prev[groupId].members,
            [memberId]: {
              ...prev[groupId].members[memberId],
              name,
              email
            }
          }
        }
      };
    });
  };

  // Delete a member from a group
  const deleteMember = (groupId: string, memberId: string) => {
    setGroups(prev => {
      if (!prev[groupId]) return prev;
      const newMembers = { ...prev[groupId].members };
      delete newMembers[memberId];
      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          members: newMembers
        }
      };
    });
  };

  // Mark attendance for a member
  const markAttendance = (groupId: string, memberId: string, date: string, status: "present" | "absent" | "late", notes?: string) => {
    setGroups(prev => {
      if (!prev[groupId] || !prev[groupId].members[memberId]) return prev;
      
      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          members: {
            ...prev[groupId].members,
            [memberId]: {
              ...prev[groupId].members[memberId],
              attendance: {
                ...prev[groupId].members[memberId].attendance,
                [date]: {
                  id: generateId(),
                  date,
                  status,
                  notes
                }
              }
            }
          }
        }
      };
    });
  };

  // Clear all attendance data
  const clearAttendanceData = () => {
    setGroups({});
    setCurrentGroupId(null);
    localStorage.removeItem("attendanceGroups");
    localStorage.removeItem("currentGroupId");
  };

  const contextValue: AttendanceContextType = {
    groups,
    currentGroupId,
    addGroup,
    updateGroup,
    deleteGroup,
    setCurrentGroup,
    addMember,
    updateMember,
    deleteMember,
    markAttendance,
    clearAttendanceData
  };

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};
