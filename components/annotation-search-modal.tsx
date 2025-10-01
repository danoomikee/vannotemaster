// components/annotation-search-modal.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Annotation } from "@/lib/types";
import { formatTime } from "@/lib/utils/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface AnnotationSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotations: Annotation[];
  onSelectAnnotation: (annotation: Annotation) => void;
}

export function AnnotationSearchModal({
  open,
  onOpenChange,
  annotations,
  onSelectAnnotation,
}: AnnotationSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const sortedAnnotations = useMemo(() => {
    return [...annotations].sort((a, b) => a.startTime - b.startTime);
  }, [annotations]);

  const filteredAnnotations = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) {
      return sortedAnnotations;
    }
    return sortedAnnotations.filter(
      (ann) =>
        ann.title.toLowerCase().includes(lowercasedFilter) ||
        ann.description?.toLowerCase().includes(lowercasedFilter)
    );
  }, [sortedAnnotations, searchTerm]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  const handleSelect = (annotation: Annotation) => {
    onSelectAnnotation(annotation);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Annotation</DialogTitle>
          <DialogDescription>
            Search and select an annotation to edit its details.
          </DialogDescription>
        </DialogHeader>
        <div className="relative pt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter annotations by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-label="Search annotations"
          />
        </div>
        <ScrollArea className="max-h-[50vh] -mx-6 px-6">
          <div className="flex flex-col gap-2 py-2">
            {filteredAnnotations.length > 0 ? (
              filteredAnnotations.map((annotation) => (
                <button
                  key={annotation.id}
                  onClick={() => handleSelect(annotation)}
                  className="w-full text-left p-3 rounded-md border hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                >
                  <div className="font-semibold">{annotation.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {annotation.description || "No description"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    {formatTime(annotation.startTime)}
                    {annotation.endTime
                      ? ` - ${formatTime(annotation.endTime)}`
                      : ""}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                No annotations found matching your search.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
