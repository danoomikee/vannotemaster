"use server"

import { storage } from "@/lib/storage"
import type { Annotation } from "@/lib/types"

export async function createAnnotation(data: Omit<Annotation, "id" | "createdAt" | "updatedAt">) {
  return await storage.createAnnotation(data)
}

export async function getAnnotationsByVideo(videoId: string) {
  return await storage.getAnnotationsByVideo(videoId)
}

export async function updateAnnotation(id: string, updates: Partial<Annotation>) {
  return await storage.updateAnnotation(id, updates)
}

export async function deleteAnnotation(id: string) {
  return await storage.deleteAnnotation(id)
}
