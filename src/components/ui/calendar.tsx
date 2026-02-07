"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0 relative",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 pb-3 relative items-center border-b border-border/60 mb-3",
        month_grid: "w-full border-collapse space-y-1",
        caption_label: "text-sm font-semibold text-foreground tabular-nums",
        nav: "flex items-center gap-1 absolute inset-x-0 top-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 rounded-full opacity-70 hover:opacity-100 hover:bg-accent/10 transition-all duration-200 absolute left-1 z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 rounded-full opacity-70 hover:opacity-100 hover:bg-accent/10 transition-all duration-200 absolute right-1 z-10"
        ),
        weeks: "flex flex-col gap-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-10 h-8 flex items-center justify-center text-[0.75rem] font-medium uppercase tracking-wider",
        week: "flex w-full mt-2 gap-1",
        day: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].range-end)]:rounded-r-full [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 w-full p-0 font-medium text-sm rounded-full transition-colors duration-200 hover:bg-accent/20 cursor-pointer"
        ),
        range_end: "day-range-end rounded-l-none",
        range_start: "day-range-start rounded-r-none",
        range_middle: "aria-selected:bg-accent rounded-none aria-selected:text-accent-foreground",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full font-semibold shadow-sm",
        today: "bg-accent/30 text-accent-foreground font-semibold ring-2 ring-accent/50 rounded-full",
        outside: "text-muted-foreground opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground/50 opacity-50 cursor-not-allowed hover:bg-transparent pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", className)} {...props} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
