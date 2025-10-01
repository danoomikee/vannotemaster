// src/components/end-time-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Annotation } from "@/lib/types";
import { formatTime } from "@/lib/utils/video";

interface EndTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotations: Annotation[];
  onMarkEnd: (annotationId: string) => void;
  currentTime: number;
}

export function EndTimeModal({
  open,
  onOpenChange,
  annotations,
  onMarkEnd,
  currentTime,
}: EndTimeModalProps) {
  const openAnnotations = annotations.filter(
    (a) => a.endTime === undefined || a.endTime === null
  );

  const handleSelect = (id: string) => {
    onMarkEnd(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark End Time</DialogTitle>
          <DialogDescription>
            Select an annotation to mark its end time at the current position (
            {formatTime(currentTime)}).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4 max-h-60 overflow-y-auto">
          {openAnnotations.length > 0 ? (
            openAnnotations.map((annotation) => (
              <Button
                key={annotation.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelect(annotation.id)}
              >
                {annotation.title}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No open annotations to mark.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
