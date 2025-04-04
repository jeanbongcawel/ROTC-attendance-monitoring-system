import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, QrCode, Scan, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAttendance } from "@/context/AttendanceContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import QRCodeScanner from "@/components/attendance/QRCodeScanner";
import QRCodeGenerator from "@/components/attendance/QRCodeGenerator";
import FaceScanner from "@/components/attendance/FaceScanner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  const handleMarkAttendance = (memberId: string, status: "present" | "absent" | "late" | "excused") => {
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
          {Object.keys(groups).length > 0 && (
            <Select 
              value={selectedGroupId}
              onValueChange={handleGroupChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(groups).map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Attendance for {currentGroup?.name}</CardTitle>
            <div className="flex items-center">
              <Button variant="outline" size="sm" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="mx-2 min-w-[180px]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Button variant="ghost" size="sm" onClick={handleTodayClick} className="w-full">
                      Today
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveModal("qr-scanner")}
                  className="flex items-center"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveModal("qr-generator")}
                  className="flex items-center"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveModal("face-scanner")}
                  className="flex items-center"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Face Recognition
                </Button>
              </div>
              
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No members in this group yet.</p>
                  <Button variant="link" onClick={() => navigate("/members")}>
                    Add members to get started
                  </Button>
                </div>
              ) : (
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
                                    handleMarkAttendance(member.id, currentStatus as "present" | "absent" | "late" | "excused");
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
                                    handleMarkAttendance(member.id, currentStatus as "present" | "absent" | "late" | "excused");
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
              )}
            </TabsContent>
            
            <TabsContent value="view">
              {dateAttendance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records for this date.
                </div>
              ) : (
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={activeModal === "qr-scanner"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <QRCodeScanner onClose={() => setActiveModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "qr-generator"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <QRCodeGenerator onClose={() => setActiveModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "face-scanner"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <FaceScanner onClose={() => setActiveModal(null)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;
