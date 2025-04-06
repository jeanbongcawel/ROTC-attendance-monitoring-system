
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface AttendanceDateProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const AttendanceDate: React.FC<AttendanceDateProps> = ({ selectedDate, setSelectedDate }) => {
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

  return (
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
  );
};

export default AttendanceDate;
