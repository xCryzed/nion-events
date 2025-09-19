import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "sr-only",
        caption_dropdowns: "flex justify-center gap-1",
        dropdown:
          "rounded-md border border-input bg-background px-3 py-2 text-sm",
        dropdown_month:
          "rounded-md border border-input bg-background px-3 py-2 text-sm",
        dropdown_year:
          "rounded-md border border-input bg-background px-3 py-2 text-sm",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "ring-1 ring-accent",
        day_outside: "day-outside text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ name, ...props }: DropdownProps) => {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();

          if (name === "months") {
            const months = Array.from({ length: 12 }, (_, i) => ({
              value: i.toString(),
              label: new Date(currentYear, i).toLocaleDateString(
                navigator.language,
                {
                  month: "long",
                },
              ),
            }));

            return (
              <Select
                value={props.value?.toString()}
                onValueChange={(value) => {
                  const changeEvent = {
                    target: { value },
                  } as React.ChangeEvent<HTMLSelectElement>;
                  props.onChange?.(changeEvent);
                }}
              >
                <SelectTrigger className="pr-1.5 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <ScrollArea className="h-80">
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            );
          } else if (name === "years") {
            const startYear = currentYear - 100;
            const endYear = currentYear + 10;

            const years = Array.from(
              { length: endYear - startYear + 1 },
              (_, i) => ({
                value: (startYear + i).toString(),
                label: (startYear + i).toString(),
              }),
            );

            return (
              <Select
                value={props.value?.toString()}
                onValueChange={(value) => {
                  const changeEvent = {
                    target: { value },
                  } as React.ChangeEvent<HTMLSelectElement>;
                  props.onChange?.(changeEvent);
                }}
              >
                <SelectTrigger className="pr-1.5 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <ScrollArea className="h-80">
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            );
          }

          return null;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
