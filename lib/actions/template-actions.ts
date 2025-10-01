"use server";

import { storage } from "@/lib/storage";
import type { Template } from "@/lib/types";

export async function createTemplate(data: {
  name: string;
  description?: string;
  fields: Array<{
    key: string;
    label: string;
    type: "string" | "number" | "date" | "boolean" | "object";
    required?: boolean;
    defaultValue?: "";
    options?: string[];
  }>;
}): Promise<Template> {
  const templateInput = {
    name: data.name,
    description: data.description,
    keys: data.fields.map((f) => f.key),
  };
  return await storage.createTemplate(templateInput);
}

export async function updateTemplate(
  id: string,
  updates: Partial<Template>
): Promise<Template> {
  return await storage.updateTemplate(id, updates);
}

export async function deleteTemplate(id: string): Promise<void> {
  return await storage.deleteTemplate(id);
}

export async function getAllTemplates(): Promise<Template[]> {
  return await storage.getAllTemplates();
}

export async function getTemplate(id: string): Promise<Template | null> {
  return await storage.getTemplate(id);
}
