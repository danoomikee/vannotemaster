"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CollectionForm } from "@/components/collection-form"
import type { Collection, Template } from "@/lib/types"

interface CollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection?: Collection | null
  templates: Template[]
  videoId: string
  onSave: (data: Partial<Collection>) => void
}

export function CollectionModal({ open, onOpenChange, collection, templates, videoId, onSave }: CollectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{collection ? "Edit Collection" : "Create Collection"}</DialogTitle>
        </DialogHeader>
        <CollectionForm
          collection={collection || undefined}
          templates={templates}
          videoId={videoId}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
