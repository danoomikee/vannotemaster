// components/template-form.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { Template } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { DialogFooter } from "./ui/dialog";

interface TemplateFormProps {
  template?: Template;
  onSave: (template: Omit<Template, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function TemplateForm({
  template,
  onSave,
  onCancel,
}: TemplateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keys, setKeys] = useState<string[]>([]);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setKeys(template.keys || []);
    } else {
      setName("");
      setDescription("");
      setKeys([]);
    }
  }, [template]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, description, keys });
  };

  const addKey = () => {
    const formattedKey = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (formattedKey && !keys.includes(formattedKey)) {
      setKeys([...keys, formattedKey]);
      setNewKey("");
    }
  };

  const removeKey = (keyToRemove: string) => {
    setKeys(keys.filter((key) => key !== keyToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKey();
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Scene Analysis"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-description">Description</Label>
        <Textarea
          id="template-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional: Describe what this template is for"
        />
      </div>

      <div className="space-y-3">
        <Label>Metadata Keys</Label>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="new_key_name"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="button" onClick={addKey} disabled={!newKey.trim()}>
              <Plus className="h-4 w-4 mr-2" /> Add Key
            </Button>
          </div>
          <ScrollArea className="h-40">
            <div className="space-y-2 pr-4">
              {keys.length > 0 ? (
                keys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm p-2 bg-muted rounded-md"
                  >
                    <code>{key}</code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeKey(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No keys added yet.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      <DialogFooter className="border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Save Template
        </Button>
      </DialogFooter>
    </form>
  );
}
