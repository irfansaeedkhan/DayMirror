"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { parseDateOnly } from "@/lib/date-utils";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const selected = value ? parseDateOnly(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-10 lg:h-11 justify-start rounded-xl px-3 font-normal text-sm lg:text-base cursor-pointer",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 lg:size-5 shrink-0 opacity-70" />
          {value ? format(selected!, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl shadow-elevated border-border/80"
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            onChange(`${y}-${m}-${d}`);
          }}
          initialFocus
          className="[--cell-size:2.25rem] sm:[--cell-size:2.5rem] lg:[--cell-size:2.85rem] p-3 lg:p-4"
        />
      </PopoverContent>
    </Popover>
  );
}
