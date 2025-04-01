
import React from "react";
import { Progress as BaseProgress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CustomProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

/**
 * Custom Progress component that extends the base Progress with additional styling options
 */
const CustomProgress: React.FC<CustomProgressProps> = ({ 
  value, 
  className, 
  indicatorClassName 
}) => {
  return (
    <div className={cn("relative w-full h-2 overflow-hidden rounded-full bg-muted", className)}>
      <div 
        className={cn("h-full transition-all", indicatorClassName || "bg-primary")} 
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export { CustomProgress };
