
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAttendance } from "@/context/AttendanceContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

const Groups = () => {
  const { groups, addGroup, updateGroup, deleteGroup, setCurrentGroup } = useAttendance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [editingGroup, setEditingGroup] = useState<{ id: string; name: string; description: string }>({ id: "", name: "", description: "" });

  const handleAddGroup = () => {
    if (newGroupName.trim() === "") {
      toast.error("Group name cannot be empty");
      return;
    }

    const newGroup = {
      id: uuidv4(),
      name: newGroupName,
      description: newGroupDescription,
      members: {}
    };

    addGroup(newGroup);
    toast.success(`Group "${newGroupName}" created`);
    setNewGroupName("");
    setNewGroupDescription("");
    setIsAddDialogOpen(false);
  };

  const handleEditGroup = () => {
    if (editingGroup.name.trim() === "") {
      toast.error("Group name cannot be empty");
      return;
    }

    updateGroup(editingGroup.id, {
      name: editingGroup.name,
      description: editingGroup.description
    });
    toast.success(`Group "${editingGroup.name}" updated`);
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (id: string, name: string, description?: string) => {
    setEditingGroup({ id, name, description: description || "" });
    setIsEditDialogOpen(true);
  };

  const handleDeleteGroup = (id: string, name: string) => {
    deleteGroup(id);
    toast.success(`Group "${name}" deleted`);
  };

  const handleGroupSelect = (id: string) => {
    setCurrentGroup(id);
  };

  // Count members in a group
  const countMembers = (groupId: string) => {
    return Object.keys(groups[groupId]?.members || {}).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Manage your classes, meetings or events.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new group</DialogTitle>
              <DialogDescription>
                Add a new class, meeting or event group for attendance tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter group description"
                  rows={3}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No groups yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2 mb-4">
            Create your first group to start tracking attendance for classes, meetings or events.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Group
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(groups).map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="bg-secondary/10 pb-4">
                <CardTitle>{group.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {group.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-sm">{countMembers(group.id)} members</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-card pt-4 border-t">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => openEditDialog(group.id, group.name, group.description)}
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
                          This will delete the group "{group.name}" and all associated member data.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Link to="/members" onClick={() => handleGroupSelect(group.id)}>
                  <Button>Manage Members</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
            <DialogDescription>
              Update the details of this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter group name"
                value={editingGroup.name}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter group description"
                rows={3}
                value={editingGroup.description}
                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditGroup}>Update Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
