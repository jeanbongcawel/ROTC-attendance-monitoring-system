
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAttendance } from "@/context/AttendanceContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, UserPlus, ArrowLeft, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Members = () => {
  const { groups, currentGroupId, setCurrentGroup, addMember, updateMember, deleteMember } = useAttendance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [editingMember, setEditingMember] = useState({ id: "", name: "", email: "" });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  const handleAddMember = () => {
    if (!selectedGroupId) return;
    
    if (newMemberName.trim() === "") {
      toast.error("Member name cannot be empty");
      return;
    }

    addMember(selectedGroupId, newMemberName, newMemberEmail);
    toast.success(`Member "${newMemberName}" added`);
    setNewMemberName("");
    setNewMemberEmail("");
    setIsAddDialogOpen(false);
  };

  const handleEditMember = () => {
    if (!selectedGroupId) return;
    
    if (editingMember.name.trim() === "") {
      toast.error("Member name cannot be empty");
      return;
    }

    updateMember(selectedGroupId, editingMember.id, editingMember.name, editingMember.email);
    toast.success(`Member "${editingMember.name}" updated`);
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (id: string, name: string, email: string) => {
    setEditingMember({ id, name, email });
    setIsEditDialogOpen(true);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (!selectedGroupId) return;
    
    deleteMember(selectedGroupId, id);
    toast.success(`Member "${name}" removed`);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentGroup(groupId);
  };

  const filteredMembers = selectedGroupId
    ? Object.values(groups[selectedGroupId]?.members || {}).filter(
        member => 
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!selectedGroupId) {
    return null;
  }

  const currentGroup = groups[selectedGroupId];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost"
          className="mr-4"
          onClick={() => navigate("/groups")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentGroup?.name}</h1>
          <p className="text-muted-foreground">
            Manage members for this group
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:max-w-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {Object.keys(groups).length > 1 && (
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
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new member</DialogTitle>
                <DialogDescription>
                  Add a member to the {currentGroup?.name} group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter member name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter member email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"} in this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No members yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-2 mb-4">
                Add your first member to start tracking attendance.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(member.id, member.name, member.email)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete the member "{member.name}" and all their attendance records.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMember(member.id, member.name)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit member</DialogTitle>
            <DialogDescription>
              Update the details of this member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter member name"
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (optional)</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter member email"
                value={editingMember.email}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditMember}>Update Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
