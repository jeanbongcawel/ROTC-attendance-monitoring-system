
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GroupsData } from "@/types/attendance";

interface AttendanceGroupSelectProps {
  selectedGroupId: string | null;
  groups: GroupsData;
  onGroupChange: (groupId: string) => void;
}

const AttendanceGroupSelect: React.FC<AttendanceGroupSelectProps> = ({
  selectedGroupId,
  groups,
  onGroupChange
}) => {
  if (!Object.keys(groups).length) {
    return null;
  }
  
  return (
    <Select 
      value={selectedGroupId || undefined}
      onValueChange={onGroupChange}
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
  );
};

export default AttendanceGroupSelect;
