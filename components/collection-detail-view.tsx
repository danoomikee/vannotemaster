"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit, Trash2, Plus, X, Save } from "lucide-react";
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
  onSave: (data: Partial<Collection>) => void;
}

export function CollectionDetailView({
  collection,
  annotations,
  templates,
  collections,
  onBack,
  onAddAnnotations,
  onAnnotationClick,
  onRemoveAnnotation,
  onCollectionChange,
  onSave,
}: CollectionDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editDescription, setEditDescription] = useState(
    collection.description || ""
  );
  const [editMetadata, setEditMetadata] = useState<Record<string, string>>(
    collection.metadata
  );

  const handleCollectionChange = (newCollection: Collection) => {
    setIsEditing(false);
    setEditName(newCollection.name);
    setEditDescription(newCollection.description || "");
    setEditMetadata(newCollection.metadata);
    onCollectionChange(newCollection);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") return;
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const newMetadata: Record<string, string> = { ...editMetadata };
      template.keys.forEach((key) => {
        if (!(key in newMetadata)) {
          newMetadata[key] = "";
        }
      });
      setEditMetadata(newMetadata);
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    setEditMetadata({ ...editMetadata, [key]: value });
  };

  const handleAddCustomKey = () => {
    const key = prompt("Enter metadata key name:");
    if (key && key.trim()) {
      setEditMetadata({ ...editMetadata, [key.trim()]: "" });
    }
  };

  const handleRemoveKey = (key: string) => {
    const newMetadata = { ...editMetadata };
    delete newMetadata[key];
    setEditMetadata(newMetadata);
  };

  const handleSave = () => {
    onSave({
      name: editName,
      description: editDescription,
      metadata: editMetadata,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(collection.name);
    setEditDescription(collection.description || "");
    setEditMetadata(collection.metadata);
    setIsEditing(false);
  };

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
              if (newCollection) handleCollectionChange(newCollection);
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
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-2 w-2 mr-1" />
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-2 w-2 mr-1" />
              </Button>
            </>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3 mb-3">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-xs">
                Collection Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter collection name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-description" className="text-xs">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
          </div>
        ) : (
          collection.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {collection.description}
            </p>
          )
        )}

        {isEditing ? (
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-sm">Metadata</CardTitle>
                <div className="flex gap-2">
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="h-7 text-xs w-[140px]">
                      <SelectValue placeholder="Apply template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Template</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomKey}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Key
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(editMetadata).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No metadata keys. Apply a template or add custom keys.
                </p>
              ) : (
                Object.entries(editMetadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {key}
                      </Label>
                      <Input
                        value={value}
                        onChange={(e) =>
                          handleMetadataChange(key, e.target.value)
                        }
                        placeholder={`Enter ${key}`}
                        className="h-8"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKey(key)}
                      className="mt-5"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          Object.keys(collection.metadata).length > 0 && (
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
          )
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
