"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock } from "lucide-react"
import type { Annotation, Template } from "@/lib/types"
import { formatTime, parseTime } from "@/lib/utils/video"
import { ScrollArea } from "./ui/scroll-area"

interface AnnotationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  annotation?: Annotation | null
  templates: Template[]
  onSave: (data: Partial<Annotation>) => void
  defaultStartTime?: number
}

export function AnnotationModal({
  open,
  onOpenChange,
  annotation,
  templates,
  onSave,
  defaultStartTime,
}: AnnotationModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (open) {
      if (annotation) {
        setTitle(annotation.title)
        setDescription(annotation.description || "")
        setStartTime(annotation.startTime)
        setEndTime(annotation.endTime)
      } else {
        setTitle("")
        setDescription("")
        setStartTime(defaultStartTime || 0)
        setEndTime(undefined)
      }
    }
  }, [annotation, open, defaultStartTime])

  const handleSave = () => {
    onSave({
      id: annotation?.id,
      title,
      description,
      startTime,
      endTime,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{annotation ? "Edit Annotation" : "Create Annotation"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Start Time
                  </div>
                </Label>
                <Input
                  id="start-time"
                  value={formatTime(startTime)}
                  onChange={(e) => setStartTime(parseTime(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> End Time
                  </div>
                </Label>
                <Input
                  id="end-time"
                  value={endTime !== undefined ? formatTime(endTime) : ""}
                  onChange={(e) => setEndTime(parseTime(e.target.value) || undefined)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {annotation ? "Update" : "Create"} Annotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
