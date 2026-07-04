"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function buildTimeOptions(stepMinutes = 30): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}

function formatTimeLabel(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

type TimePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function TimePicker({ value, onChange, className, placeholder = "Select time" }: TimePickerProps) {
  const options = useMemo(() => buildTimeOptions(30), []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-10 min-w-[8.5rem] rounded-xl text-sm lg:text-base cursor-pointer", className)}>
        <Clock className="mr-2 size-4 shrink-0 opacity-60" />
        <SelectValue placeholder={placeholder}>
          {value ? formatTimeLabel(value) : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-64 rounded-xl">
        {options.map((t) => (
          <SelectItem key={t} value={t} className="cursor-pointer rounded-lg">
            {formatTimeLabel(t)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
