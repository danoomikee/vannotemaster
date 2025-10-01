// components/video-edit-modal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Video } from "@/lib/types";

interface VideoEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
  onSave: (videoId: string, data: Partial<Omit<Video, "id">>) => void;
}

export function VideoEditModal({
  open,
  onOpenChange,
  video,
  onSave,
}: VideoEditModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (video) {
      setTitle(video.title);
    } else {
      // Reset form when there's no video (e.g., on close)
      setTitle("");
    }
  }, [video, open]);

  const handleSave = () => {
    if (!video || !title.trim()) {
      return;
    }
    onSave(video.id, { title: title.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Video Details</DialogTitle>
          <DialogDescription>
            Modify the title and description for your video.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video-title" className="text-right">
              Title
            </Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
