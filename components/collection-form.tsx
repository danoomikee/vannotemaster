"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import type { Collection, Template } from "@/lib/types";

interface CollectionFormProps {
  collection?: Collection;
  templates: Template[];
  videoId: string;
  onSave: (data: Partial<Collection>) => void;
  onCancel: () => void;
}

export function CollectionForm({
  collection,
  templates,
  videoId,
  onSave,
  onCancel,
}: CollectionFormProps) {
  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [metadata, setMetadata] = useState<Record<string, string>>(
    collection?.metadata || {}
  );

  // Apply template when selected
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") return;

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      // Create empty metadata keys from template
      const newMetadata: Record<string, string> = { ...metadata };
      template.keys.forEach((key) => {
        if (!(key in newMetadata)) {
          newMetadata[key] = "";
        }
      });
      setMetadata(newMetadata);
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    setMetadata({ ...metadata, [key]: value });
  };

  const handleAddCustomKey = () => {
    const key = prompt("Enter metadata key name:");
    if (key && key.trim()) {
      setMetadata({ ...metadata, [key.trim()]: "" });
    }
  };

  const handleRemoveKey = (key: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[key];
    setMetadata(newMetadata);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      metadata,
      videoId,
      annotationIds: collection?.annotationIds || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Collection Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter collection name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Apply Template (Optional)</Label>
        <Select onValueChange={handleTemplateSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template to apply" />
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
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Metadata</Label>
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

        {Object.keys(metadata).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No metadata keys. Apply a template or add custom keys.
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-3">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">{key}</Label>
                  <Input
                    value={value}
                    onChange={(e) => handleMetadataChange(key, e.target.value)}
                    placeholder={`Enter ${key}`}
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
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {collection ? "Update Collection" : "Create Collection"}
        </Button>
      </div>
    </form>
  );
}
