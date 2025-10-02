"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface SeekToTimeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSeek: (time: number) => void
  duration: number
}

export function SeekToTimeModal({ open, onOpenChange, onSeek, duration }: SeekToTimeModalProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")

  const parseTimeInput = (value: string): number | null => {
    // Try to extract time from YouTube URL
    const urlMatch = value.match(/[?&]t=(\d+)/)
    if (urlMatch) {
      return Number.parseInt(urlMatch[1], 10)
    }

    // Try to parse as plain seconds
    const seconds = Number.parseInt(value.trim(), 10)
    if (!isNaN(seconds) && seconds >= 0) {
      return seconds
    }

    return null
  }

  const formatTimeDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const time = parseTimeInput(input)

    if (time === null) {
      setError("Invalid input. Enter seconds (e.g., 183) or a YouTube URL with timestamp.")
      return
    }

    if (time > duration) {
      setError(`Time ${formatTimeDisplay(time)} exceeds video duration ${formatTimeDisplay(Math.floor(duration))}.`)
      return
    }

    onSeek(time)
    setInput("")
    setError("")
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInput("")
      setError("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seek to Time</DialogTitle>
          <DialogDescription>
            Enter time in seconds or paste a YouTube URL with timestamp (e.g., ?t=183)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="time-input">Time or URL</Label>
            <Input
              id="time-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="183 or https://youtu.be/...?t=183"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Seek</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
