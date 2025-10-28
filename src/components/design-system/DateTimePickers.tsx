"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Calendar } from "@/components/ui/lovable/calendar";
import { Button } from "@/components/ui/lovable/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/lovable/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/lovable/select";
import { Label } from "@/components/ui/lovable/label";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export default function DateTimePickers() {
  const [date, setDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateTime, setDateTime] = useState<Date>();
  const [time, setTime] = useState<{ hours: string; minutes: string }>({ hours: "12", minutes: "00" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Date & Time Pickers</h2>
        <p className="text-muted-foreground">
          Schedule deliveries, set deadlines, and manage time-sensitive operations
        </p>
      </div>

      {/* Single Date Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Single Date Picker</CardTitle>
          <CardDescription>Select a delivery date or deadline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {date && (
            <div className="p-4 bg-muted rounded-lg animate-in fade-in duration-300">
              <p className="text-sm">
                <span className="font-medium">Selected: </span>
                {format(date, "PPPP")}
              </p>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <code className="text-xs">
              {`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon />
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range Picker</CardTitle>
          <CardDescription>Select delivery window or reporting period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Delivery Window</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {dateRange?.from && (
            <div className="p-4 bg-muted rounded-lg animate-in fade-in duration-300">
              <p className="text-sm">
                <span className="font-medium">From: </span>
                {format(dateRange.from, "PPP")}
              </p>
              {dateRange.to && (
                <p className="text-sm mt-1">
                  <span className="font-medium">To: </span>
                  {format(dateRange.to, "PPP")}
                </p>
              )}
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <code className="text-xs">
              {`<Calendar
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
  numberOfMonths={2}
/>`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Time Picker</CardTitle>
          <CardDescription>Schedule specific delivery time slots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTime ? format(dateTime, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTime} onSelect={setDateTime} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Delivery Time</Label>
              <div className="flex gap-2">
                <Select value={time.hours} onValueChange={(value) => setTime({ ...time, hours: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="flex items-center text-2xl">:</span>

                <Select value={time.minutes} onValueChange={(value) => setTime({ ...time, minutes: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Minutes" />
                  </SelectTrigger>
                  <SelectContent>
                    {["00", "15", "30", "45"].map((min) => (
                      <SelectItem key={min} value={min}>
                        {min}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {dateTime && (
            <div className="p-4 bg-muted rounded-lg animate-in fade-in duration-300">
              <p className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Scheduled: </span>
                {format(dateTime, "PPPP")} at {time.hours}:{time.minutes}
              </p>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <code className="text-xs whitespace-pre-wrap break-all">
              {`// Combine date picker with time selects
const [dateTime, setDateTime] = useState<Date>()
const [time, setTime] = useState({ hours: "12", minutes: "00" })

// Merge them when submitting
const scheduledDateTime = new Date(dateTime)
scheduledDateTime.setHours(parseInt(time.hours))
scheduledDateTime.setMinutes(parseInt(time.minutes))`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Quick Date Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Date Presets</CardTitle>
          <CardDescription>Common delivery date shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setDate(tomorrow);
              }}
            >
              Tomorrow
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                setDate(nextWeek);
              }}
            >
              Next Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setDate(nextMonth);
              }}
            >
              Next Month
            </Button>
          </div>

          {date && (
            <div className="p-4 bg-muted rounded-lg animate-in fade-in duration-300">
              <p className="text-sm">
                <span className="font-medium">Quick select: </span>
                {format(date, "PPPP")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Plans Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Plans Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Single Date Picker For:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>One-time delivery date</li>
                <li>Deadline for delivery plan creation</li>
                <li>Expected delivery completion date</li>
                <li>Plan activation date</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Date Range Picker For:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Delivery window (e.g., deliver between March 1-5)</li>
                <li>Reporting period for delivery analytics</li>
                <li>Filter deliveries by date range</li>
                <li>Recurring delivery schedule (weekly/monthly)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Date & Time Picker For:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Specific delivery time slots</li>
                <li>Scheduled notifications</li>
                <li>Time-sensitive operations</li>
                <li>Coordinated multi-location deliveries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Disable past dates for future delivery scheduling</li>
            <li>• Show timezone information for clarity</li>
            <li>• Provide quick presets for common selections</li>
            <li>• Validate date ranges (end after start)</li>
            <li>• Use consistent date format across the app</li>
            <li>• Consider business hours for time selection</li>
            <li>• Show confirmation summary before submission</li>
            <li>• Handle edge cases (holidays, weekends)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Dependencies</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• react-day-picker - Calendar component</li>
              <li>• date-fns - Date formatting and manipulation</li>
              <li>• Popover component - Dropdown behavior</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Date Validation Example</h4>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-xs whitespace-pre-wrap">
{`// Disable past dates
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()}
/>

// Disable weekends
disabled={(date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
}}`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
