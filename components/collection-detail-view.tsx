"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import type { Collection, Annotation, Template } from "@/lib/types";
import { formatTime } from "@/lib/utils/video";

interface CollectionDetailViewProps {
  collection: Collection;
  annotations: Annotation[];
  templates: Template[];
  collections: Collection[];
  onBack: () => void;
  onEdit: (collection: Collection) => void;
  onAddAnnotations: (collection: Collection) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onRemoveAnnotation: (collectionId: string, annotationId: string) => void;
  onReorderAnnotations: (collectionId: string, annotationIds: string[]) => void;
  onCollectionChange: (collection: Collection) => void;
}

export function CollectionDetailView({
  collection,
  annotations,
  templates,
  collections,
  onBack,
  onEdit,
  onAddAnnotations,
  onAnnotationClick,
  onRemoveAnnotation,
  onReorderAnnotations,
  onCollectionChange,
}: CollectionDetailViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Select
            value={collection.id}
            onValueChange={(id) => {
              const newCollection = collections.find((c) => c.id === id);
              if (newCollection) onCollectionChange(newCollection);
            }}
          >
            <SelectTrigger className="flex-1 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {collections.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(collection)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        {collection.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {collection.description}
          </p>
        )}

        {Object.keys(collection.metadata).length > 0 && (
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(collection.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium">{value || "(empty)"}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Annotations ({annotations.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddAnnotations(collection)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 pb-4 space-y-2">
            {annotations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No annotations in this collection yet.
              </p>
            ) : (
              annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent cursor-pointer group"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={() => onAnnotationClick(annotation)}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium truncate">
                        {annotation.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {formatTime(annotation.startTime)}
                        {annotation.endTime && (
                          <> → {formatTime(annotation.endTime)}</>
                        )}
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() =>
                      onRemoveAnnotation(collection.id, annotation.id)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
