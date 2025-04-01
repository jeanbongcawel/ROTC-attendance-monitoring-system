
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAttendance } from "@/context/AttendanceContext";
import { toast } from "sonner";
import { Download, Upload, Trash2, FileText } from "lucide-react";

const Settings = () => {
  const { groups, clearAttendanceData } = useAttendance();
  const [isExporting, setIsExporting] = useState(false);

  const handleClearData = () => {
    clearAttendanceData();
    toast.success("All data cleared successfully");
  };

  const handleExportData = () => {
    try {
      setIsExporting(true);
      
      // Create data to export
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          groups
        }
      };
      
      // Convert to JSON string
      const dataStr = JSON.stringify(exportData, null, 2);
      
      // Create download link
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create and trigger download
      const exportFileDefaultName = `attendance-data-${new Date().toISOString().slice(0,10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Basic validation
        if (!importedData.data?.groups) {
          throw new Error("Invalid data format");
        }

        // Replace localStorage data with imported data
        localStorage.setItem("attendanceGroups", JSON.stringify(importedData.data.groups));
        
        // Reload the page to refresh data from localStorage
        window.location.reload();
        
        toast.success("Data imported successfully");
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import data. Invalid format.");
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your attendance tracking system settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export or import your attendance data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your attendance data as a JSON file
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleExportData} 
                disabled={isExporting || Object.keys(groups).length === 0}
              >
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <h3 className="font-medium">Import Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Import attendance data from a previously exported file
                  </p>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  id="import-file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById("import-file")?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md border-destructive/20 bg-destructive/5">
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-destructive mr-3" />
                <div>
                  <h3 className="font-medium">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Delete all groups, members and attendance records
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Clear Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all your data, including all groups, members, and attendance records.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearData}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Information about this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <h3 className="font-medium">Unity Tracker v1.0</h3>
                <p className="text-sm text-muted-foreground">
                  A simple, effective attendance tracking system
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-2 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
              <li>Create and manage multiple groups</li>
              <li>Add and manage members</li>
              <li>Track attendance with present, absent, and late statuses</li>
              <li>Add notes to attendance records</li>
              <li>View attendance data by date</li>
              <li>Export and import data</li>
            </ul>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
