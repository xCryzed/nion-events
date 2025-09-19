import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  label,
  disabled,
}: TimePickerProps) {
  const [hour, minute] = value ? value.split(":") : ["", ""];

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute || "00"}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour || "00"}:${newMinute}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0"),
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Select
          value={hour}
          onValueChange={handleHourChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Std" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {hours.map((h) => (
              <SelectItem key={h} value={h} className="hover:bg-muted">
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">:</span>

        <Select
          value={minute}
          onValueChange={handleMinuteChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {minutes.map((m) => (
              <SelectItem key={m} value={m} className="hover:bg-muted">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
