// src/components/shortcuts-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

// Kbd component for styling keyboard keys
function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-background border rounded-lg">
      {children}
    </kbd>
  );
}

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  const shortcuts = [
    { key: "Space", action: "Play / Pause video" },
    { key: "← / →", action: "Seek 5s backward / forward" },
    { key: "M", action: "Create a quick annotation" },
    { key: "Shift + M", action: "Create a detailed annotation" },
    { key: "S", action: "Seek to previous annotation" },
    { key: "D", action: "Seek to next annotation" },
    { key: "E", action: "Mark end time for an annotation" },
    { key: "N", action: "Resume video and exit annotator" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ul className="space-y-2">
            {shortcuts.map(({ key, action }) => (
              <li key={key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{action}</span>
                <Kbd>{key}</Kbd>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
