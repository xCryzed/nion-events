import React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (datetime: string) => void;
  label: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  disabled,
}: DateTimePickerProps) {
  const dateTime = value ? new Date(value) : undefined;
  const timeString = dateTime ? format(dateTime, "HH:mm") : "";

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }

    const [hours = "00", minutes = "00"] = timeString.split(":");
    date.setHours(parseInt(hours), parseInt(minutes));
    onChange(date.toISOString());
  };

  const handleTimeChange = (time: string) => {
    if (!dateTime) return;

    const [hours, minutes] = time.split(":");
    const newDate = new Date(dateTime);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    onChange(newDate.toISOString());
  };

  const handleHourChange = (hour: string) => {
    const [, minute] = timeString.split(":");
    handleTimeChange(`${hour}:${minute || "00"}`);
  };

  const handleMinuteChange = (minute: string) => {
    const [hour] = timeString.split(":");
    handleTimeChange(`${hour || "00"}:${minute}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0"),
  );

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <div className="flex flex-col gap-2">
        {/* Date Picker */}
        <div className="w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full h-10",
                  !dateTime && "text-muted-foreground",
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTime
                  ? format(dateTime, "dd.MM.yyyy", { locale: de })
                  : "Datum wählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-background border z-50"
              align="start"
            >
              <div className="p-3 border-b bg-muted/50">
                <p className="text-sm font-medium text-center">
                  {dateTime
                    ? format(dateTime, "MMMM yyyy", { locale: de })
                    : format(new Date(), "MMMM yyyy", { locale: de })}
                </p>
              </div>
              <Calendar
                mode="single"
                selected={dateTime}
                onSelect={handleDateChange}
                disabled={(date) => {
                  // Normalize dates to start of day for comparison
                  const dateOnly = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                  );
                  const minDateOnly = minDate
                    ? new Date(
                        minDate.getFullYear(),
                        minDate.getMonth(),
                        minDate.getDate(),
                      )
                    : null;
                  const maxDateOnly = maxDate
                    ? new Date(
                        maxDate.getFullYear(),
                        maxDate.getMonth(),
                        maxDate.getDate(),
                      )
                    : null;

                  return (
                    (minDateOnly && dateOnly < minDateOnly) ||
                    (maxDateOnly && dateOnly > maxDateOnly)
                  );
                }}
                initialFocus
                showOutsideDays
                className="p-3 pointer-events-auto"
                locale={de}
                fromDate={minDate}
                toDate={maxDate}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        <div className="flex items-center gap-2 h-10 justify-start">
          <Select
            value={timeString.split(":")[0] || ""}
            onValueChange={handleHourChange}
            disabled={disabled || !dateTime}
          >
            <SelectTrigger className="w-20 h-10">
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
            value={timeString.split(":")[1] || ""}
            onValueChange={handleMinuteChange}
            disabled={disabled || !dateTime}
          >
            <SelectTrigger className="w-20 h-10">
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
    </div>
  );
}
