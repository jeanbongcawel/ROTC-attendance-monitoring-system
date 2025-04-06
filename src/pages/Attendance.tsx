
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttendance } from "@/context/AttendanceContext";
import { toast } from "sonner";
import { AttendanceStatus } from "@/types/attendance";

// Import our new components
import AttendanceDate from "@/components/attendance/AttendanceDate";
import AttendanceGroupSelect from "@/components/attendance/AttendanceGroupSelect";
import MarkAttendancePanel from "@/components/attendance/MarkAttendancePanel";
import ViewAttendancePanel from "@/components/attendance/ViewAttendancePanel";
import AttendanceModals from "@/components/attendance/AttendanceModals";

const Attendance = () => {
  const { groups, currentGroupId, setCurrentGroup, markAttendance } = useAttendance();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [excuses, setExcuses] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("mark");
  const [activeModal, setActiveModal] = useState<"qr-scanner" | "qr-generator" | "face-scanner" | null>(null);
  const navigate = useNavigate();

  // Format date as "YYYY-MM-DD" for storage
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    if (currentGroupId) {
      setSelectedGroupId(currentGroupId);
    } else if (Object.keys(groups).length > 0) {
      setSelectedGroupId(Object.keys(groups)[0]);
      setCurrentGroup(Object.keys(groups)[0]);
    } else {
      navigate("/groups");
      toast.error("Please create a group first");
    }
  }, [currentGroupId, groups, setCurrentGroup, navigate]);

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentGroup(groupId);
  };

  const handleMarkAttendance = (memberId: string, status: AttendanceStatus) => {
    if (!selectedGroupId) return;
    
    markAttendance(
      selectedGroupId,
      memberId,
      formattedDate,
      status,
      notes[memberId],
      excuses[memberId]
    );
    
    toast.success(`Attendance marked for ${groups[selectedGroupId].members[memberId].name}`);
  };

  const handleNoteChange = (memberId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [memberId]: note
    }));
  };

  const handleExcuseChange = (memberId: string, excuse: string) => {
    setExcuses(prev => ({
      ...prev,
      [memberId]: excuse
    }));
  };

  const getAttendanceStatus = (memberId: string) => {
    if (!selectedGroupId) return null;
    
    const member = groups[selectedGroupId]?.members[memberId];
    return member?.attendance[formattedDate]?.status || null;
  };

  const getNotes = (memberId: string) => {
    if (!selectedGroupId) return "";
    
    const member = groups[selectedGroupId]?.members[memberId];
    return member?.attendance[formattedDate]?.notes || notes[memberId] || "";
  };

  const getExcuse = (memberId: string) => {
    if (!selectedGroupId) return "";
    
    const member = groups[selectedGroupId]?.members[memberId];
    return member?.attendance[formattedDate]?.excuse || excuses[memberId] || "";
  };

  const getAttendanceForDate = () => {
    if (!selectedGroupId) return [];
    
    return Object.values(groups[selectedGroupId]?.members || {})
      .map(member => {
        const attendanceRecord = member.attendance[formattedDate];
        return {
          id: member.id,
          name: member.name,
          status: attendanceRecord?.status || null,
          notes: attendanceRecord?.notes || "",
          excuse: attendanceRecord?.excuse || "",
          method: attendanceRecord?.method || "manual"
        };
      })
      .filter(record => record.status !== null);
  };

  if (!selectedGroupId) {
    return null;
  }

  const currentGroup = groups[selectedGroupId];
  const members = Object.values(currentGroup?.members || {});
  const dateAttendance = getAttendanceForDate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track attendance for your groups
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <AttendanceGroupSelect 
            selectedGroupId={selectedGroupId} 
            groups={groups} 
            onGroupChange={handleGroupChange}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Attendance for {currentGroup?.name}</CardTitle>
            <AttendanceDate selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>
          <CardDescription>
            Manage attendance for {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
              <TabsTrigger value="view">View Attendance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mark">
              <MarkAttendancePanel 
                members={members}
                formattedDate={formattedDate}
                getAttendanceStatus={getAttendanceStatus}
                getNotes={getNotes}
                getExcuse={getExcuse}
                handleMarkAttendance={handleMarkAttendance}
                handleNoteChange={handleNoteChange}
                handleExcuseChange={handleExcuseChange}
                onOpenModal={setActiveModal}
                navigate={navigate}
              />
            </TabsContent>
            
            <TabsContent value="view">
              <ViewAttendancePanel dateAttendance={dateAttendance} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AttendanceModals 
        activeModal={activeModal} 
        onCloseModal={() => setActiveModal(null)} 
      />
    </div>
  );
};

export default Attendance;
