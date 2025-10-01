"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Annotation } from "@/lib/types"
import { formatTime, parseTime } from "@/lib/utils/video"

interface AnnotationFormProps {
  videoId: string
  currentTime: number
  annotation?: Annotation
  onSave: (annotation: Annotation) => void
  onCancel: () => void
}

export function AnnotationForm({ videoId, currentTime, annotation, onSave, onCancel }: AnnotationFormProps) {
  const [title, setTitle] = useState(annotation?.title || "")
  const [description, setDescription] = useState(annotation?.description || "")
  const [startTime, setStartTime] = useState(annotation?.startTime ?? currentTime)
  const [endTime, setEndTime] = useState(annotation?.endTime)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    const newAnnotation: Annotation = {
      id: annotation?.id || crypto.randomUUID(),
      videoId,
      title,
      description,
      startTime,
      endTime,
      createdAt: annotation?.createdAt || new Date(),
      updatedAt: new Date(),
    }
    await onSave(newAnnotation)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            value={formatTime(startTime)}
            onChange={(e) => setStartTime(parseTime(e.target.value))}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">End Time (Optional)</Label>
          <Input
            id="end-time"
            value={endTime ? formatTime(endTime) : ""}
            onChange={(e) => setEndTime(parseTime(e.target.value) || undefined)}
            className="font-mono"
            placeholder="Leave empty for single timestamp"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? "Saving..." : annotation ? "Update Annotation" : "Create Annotation"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
