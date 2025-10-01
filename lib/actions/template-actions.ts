"use server"

import { storage } from "@/lib/storage"
import type { Template } from "@/lib/types"

export async function createTemplate(data: {
  name: string
  description?: string
  fields: Array<{
    key: string
    label: string
    type: "string" | "number" | "date" | "boolean" | "object"
    required?: boolean
    defaultValue?: any
    options?: string[]
  }>
}): Promise<Template> {
  return await storage.createTemplate(data)
}

export async function updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
  return await storage.updateTemplate(id, updates)
}

export async function deleteTemplate(id: string): Promise<void> {
  return await storage.deleteTemplate(id)
}

export async function getAllTemplates(): Promise<Template[]> {
  return await storage.getAllTemplates()
}

export async function getTemplate(id: string): Promise<Template | null> {
  return await storage.getTemplate(id)
}
