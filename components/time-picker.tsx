"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function TimePickerDemo({ value, onChange }) {
  const minuteRef = React.useRef<HTMLDivElement>(null)
  const hourRef = React.useRef<HTMLDivElement>(null)
  const [hour, setHour] = React.useState(value ? Number.parseInt(value.split(":")[0]) : 0)
  const [minute, setMinute] = React.useState(value ? Number.parseInt(value.split(":")[1]) : 0)
  const [open, setOpen] = React.useState(false)

  const handleHourChange = (newHour: number) => {
    setHour(newHour)
    if (onChange) {
      onChange(`${newHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    }
  }

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute)
    if (onChange) {
      onChange(`${hour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`)
    }
  }

  React.useEffect(() => {
    if (open && hourRef.current) {
      const selectedHour = hourRef.current.querySelector('[data-selected="true"]')
      if (selectedHour) {
        selectedHour.scrollIntoView({ block: "center" })
      }
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="ml-2 h-10 w-10 p-0">
          <Clock className="h-4 w-4" />
          <span className="sr-only">Selecionar hora</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex h-60 p-2">
          <div className="flex flex-col">
            <div className="flex items-center justify-center rounded-md p-1 text-sm font-medium">Hora</div>
            <div ref={hourRef} className="flex flex-col overflow-y-auto py-1" style={{ maxHeight: "200px" }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-center rounded-md p-1 text-sm hover:bg-accent hover:text-accent-foreground",
                    hour === i && "bg-accent text-accent-foreground",
                  )}
                  data-selected={hour === i}
                  onClick={() => handleHourChange(i)}
                >
                  {i.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center rounded-md p-1 text-sm font-medium">Minuto</div>
            <div ref={minuteRef} className="flex flex-col overflow-y-auto py-1" style={{ maxHeight: "200px" }}>
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-center rounded-md p-1 text-sm hover:bg-accent hover:text-accent-foreground",
                    minute === i && "bg-accent text-accent-foreground",
                  )}
                  data-selected={minute === i}
                  onClick={() => handleMinuteChange(i)}
                >
                  {i.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline"
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border border-input hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"
