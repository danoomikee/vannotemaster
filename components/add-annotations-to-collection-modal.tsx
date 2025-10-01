"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/utils/video";
import type { Annotation, Collection } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import { SetStateAction, useState } from "react";

interface AddAnnotationsToCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unassignedAnnotations: Annotation[];
  collections: Collection[];
  onAddToCollection: (annotationId: string, collectionId: string) => void;
}

export function AddAnnotationsToCollectionModal({
  open,
  onOpenChange,
  unassignedAnnotations,
  collections,
  onAddToCollection,
}: AddAnnotationsToCollectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnnotations = unassignedAnnotations.filter(
    (annotation) =>
      annotation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      annotation.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCollection = (
    annotationId: string,
    collectionId: string
  ) => {
    onAddToCollection(annotationId, collectionId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Annotations to Collection</DialogTitle>
          <DialogDescription>
            Select unassigned annotations and add them to a collection. Click an
            annotation to choose a collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <Input
            placeholder="Search annotations..."
            value={searchQuery}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setSearchQuery(e.target.value)
            }
          />

          <ScrollArea className="flex-1">
            {filteredAnnotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No annotations match your search"
                  : "No unassigned annotations"}
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {annotation.title}
                      </h4>
                      {annotation.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {annotation.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(annotation.startTime)}
                        {annotation.endTime &&
                          ` - ${formatTime(annotation.endTime)}`}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4 bg-transparent"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to...
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {collections.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No collections available
                          </div>
                        ) : (
                          collections.map((collection) => (
                            <DropdownMenuItem
                              key={collection.id}
                              onClick={() =>
                                handleAddToCollection(
                                  annotation.id,
                                  collection.id
                                )
                              }
                            >
                              {collection.name}
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
