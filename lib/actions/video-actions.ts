"use server"

import { storage } from "@/lib/storage"
import type { Video } from "@/lib/types"

export async function createVideo(data: {
  title: string
  videoId?: string
  hash?: string
  url?: string
  duration?: number
}): Promise<Video> {
  return await storage.createVideo(data)
}

export async function updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
  return await storage.updateVideo(id, updates)
}

export async function deleteVideo(id: string): Promise<void> {
  return await storage.deleteVideo(id)
}

export async function getAllVideos(): Promise<Video[]> {
  return await storage.getAllVideos()
}

export async function getVideo(id: string): Promise<Video | null> {
  return await storage.getVideo(id)
}
