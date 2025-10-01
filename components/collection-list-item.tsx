"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, FolderOpen } from "lucide-react"
import type { Collection } from "@/lib/types"

interface CollectionListItemProps {
  collection: Collection
  annotationCount: number
  onSelect: (collection: Collection) => void
  onEdit: (collection: Collection) => void
  onDelete: (collectionId: string) => void
}

export function CollectionListItem({
  collection,
  annotationCount,
  onSelect,
  onEdit,
  onDelete,
}: CollectionListItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent group">
      <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => onSelect(collection)}>
        <FolderOpen className="h-4 w-4 mr-2 text-primary" />
        <div className="flex-1 text-left">
          <div className="font-medium truncate">{collection.name}</div>
          {collection.description && (
            <div className="text-xs text-muted-foreground truncate">{collection.description}</div>
          )}
        </div>
        <Badge variant="secondary" className="ml-2">
          {annotationCount}
        </Badge>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(collection)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(collection.id)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
