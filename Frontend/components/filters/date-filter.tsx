"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date") as string) : undefined,
  )
  const [preset, setPreset] = useState<string>(searchParams.get("preset") || "all")

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)

    const params = new URLSearchParams(searchParams.toString())
    params.delete("preset")

    if (newDate) {
      params.set("date", format(newDate, "yyyy-MM-dd"))
    } else {
      params.delete("date")
    }

    const query = params.toString()
    const url = query ? `?${query}` : window.location.pathname
    router.push(url)
  }

  const handlePresetChange = (value: string) => {
    setPreset(value)
    setDate(undefined)

    const params = new URLSearchParams(searchParams.toString())
    params.delete("date")

    if (value !== "all") {
      params.set("preset", value)
    } else {
      params.delete("preset")
    }

    const query = params.toString()
    const url = query ? `?${query}` : window.location.pathname
    router.push(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[150px] bg-muted/30">
          <SelectValue placeholder="All Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="custom">Custom Date</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-muted/30">
              <CalendarIcon className="h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
