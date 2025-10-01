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
    { key: "Space", action: "Play / Pause video", category: "Video" },
    { key: "← / →", action: "Seek 5s backward / forward", category: "Video" },
    { key: "M", action: "Create a quick annotation", category: "Annotations" },
    {
      key: "Shift + M",
      action: "Create a detailed annotation",
      category: "Annotations",
    },
    {
      key: "S",
      action: "Seek to previous annotation",
      category: "Annotations",
    },
    { key: "D", action: "Seek to next annotation", category: "Annotations" },
    {
      key: "E",
      action: "Mark end time for an annotation",
      category: "Annotations",
    },
    { key: "K", action: "Search annotations", category: "Annotations" },
    {
      key: "Esc",
      action: "Resume video and exit annotator",
      category: "General",
    },
    { key: "C", action: "Toggle Collections Sidebar", category: "Collections" },
    {
      key: "Shift + C",
      action: "Add annotations to collection",
      category: "Collections",
    },
    {
      key: "Shift + ←",
      action: "Previous collection",
      category: "Collections",
    },
    { key: "Shift + →", action: "Next collection", category: "Collections" },
    { key: "?", action: "Show keyboard shortcuts", category: "General" },
  ];

  // Group shortcuts by category
  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {category}
              </h3>
              <ul className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map(({ key, action }) => (
                    <li key={key} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{action}</span>
                      <Kbd>{key}</Kbd>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
