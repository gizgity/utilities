import React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  type = "text",
  placeholder = "Enter text...",
  className = "",
  ...props
}) {
  return (
    <textarea
      placeholder={placeholder}
      rows={4}
      className={cn(
        "px-4 py-2 w-full border-3 border-black shadow-md transition focus:outline-hidden focus:shadow-lg focus:translate-y-[-2px] focus:translate-x-[-2px] placeholder:text-muted-foreground font-sans",
        className
      )}
      {...props}
    />
  );
}
