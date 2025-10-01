// src/components/quick-annotation-bar.tsx

"use client";

import type React from "react";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Settings, Sparkles } from "lucide-react";
import { formatTime } from "@/lib/utils/video";

interface QuickAnnotationBarProps {
  currentTime: number;
  onQuickAnnotate: (title: string) => void;
  onDetailedAnnotate: () => void;
  disabled?: boolean;
}

export const QuickAnnotationBar = forwardRef<
  HTMLInputElement,
  QuickAnnotationBarProps
>(
  (
    { currentTime, onQuickAnnotate, onDetailedAnnotate, disabled = false },
    ref
  ) => {
    const [quickTitle, setQuickTitle] = useState("");

    const handleQuickSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (quickTitle.trim() && !disabled) {
        onQuickAnnotate(quickTitle.trim());
        setQuickTitle("");
      }
    };

    return (
      <div className="border-t bg-background p-4">
        <form onSubmit={handleQuickSubmit} className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[80px]">
            <Tag className="h-4 w-4" />
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>

          <Input
            ref={ref}
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={
              disabled
                ? "Select a video to annotate"
                : "Quick annotation (press Enter to add)"
            }
            className="flex-1"
            disabled={disabled}
          />

          <Button
            type="submit"
            size="sm"
            disabled={!quickTitle.trim() || disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onDetailedAnnotate}
            disabled={disabled}
          >
            <Settings className="h-4 w-4 mr-1" />
            Detailed
          </Button>
        </form>

        <div className="text-xs text-muted-foreground mt-2">
          {disabled ? (
            "Upload or select a video to start annotating."
          ) : (
            <>
              Tip: Press{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">M</kbd> to
              pause and create a quick annotation.
            </>
          )}
        </div>
      </div>
    );
  }
);

QuickAnnotationBar.displayName = "QuickAnnotationBar";
