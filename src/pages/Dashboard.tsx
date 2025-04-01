
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendance } from "@/context/AttendanceContext";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, Users, CheckCheck, Clock, UserCheck, UserX } from "lucide-react";
import { CustomProgress } from "@/components/ui/custom-progress";

const Dashboard = () => {
  const { groups } = useAttendance();
  const { user } = useAuth();

  // Count total members across all groups
  const totalMembers = Object.values(groups).reduce(
    (acc, group) => acc + Object.keys(group.members).length,
    0
  );

  // Count total groups
  const totalGroups = Object.keys(groups).length;

  // Get attendance statistics
  const getAttendanceStats = () => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let total = 0;

    Object.values(groups).forEach(group => {
      Object.values(group.members).forEach(member => {
        Object.values(member.attendance).forEach(record => {
          total++;
          if (record.status === "present") present++;
          else if (record.status === "absent") absent++;
          else if (record.status === "late") late++;
        });
      });
    });

    return {
      present,
      absent,
      late,
      total,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
      latePercentage: total > 0 ? Math.round((late / total) * 100) : 0
    };
  };

  const stats = getAttendanceStats();

  // Get dates with attendance data
  const getDatesWithAttendance = () => {
    const dates = new Set<string>();
    
    Object.values(groups).forEach(group => {
      Object.values(group.members).forEach(member => {
        Object.keys(member.attendance).forEach(date => {
          dates.add(date);
        });
      });
    });
    
    return dates.size;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.name || "Cadet"}! Here's your attendance overview.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Classes, meetings or events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all groups
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Total attendance entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Tracked</CardTitle>
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDatesWithAttendance()}</div>
            <p className="text-xs text-muted-foreground">
              Unique dates with records
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>
              Summary of attendance status across all groups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.total === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No attendance data recorded yet
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                      <p className="text-sm">Present</p>
                    </div>
                    <div className="text-sm">{stats.presentPercentage}%</div>
                  </div>
                  <CustomProgress value={stats.presentPercentage} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-amber-500" />
                      <p className="text-sm">Late</p>
                    </div>
                    <div className="text-sm">{stats.latePercentage}%</div>
                  </div>
                  <CustomProgress value={stats.latePercentage} className="h-2 bg-muted" indicatorClassName="bg-amber-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                      <p className="text-sm">Absent</p>
                    </div>
                    <div className="text-sm">{stats.absentPercentage}%</div>
                  </div>
                  <CustomProgress value={stats.absentPercentage} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Attendance by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-green-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Present</p>
                  <p className="text-xs text-muted-foreground">{stats.present} records</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-amber-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Late</p>
                  <p className="text-xs text-muted-foreground">{stats.late} records</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserX className="mr-2 h-5 w-5 text-red-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Absent</p>
                  <p className="text-xs text-muted-foreground">{stats.absent} records</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
