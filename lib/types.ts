// lib/types.ts

// Core types for the video annotation system

export interface Video {
  id: string
  title: string
  description?: string // Optional description for the video
  videoId?: string // YouTube video ID
  hash?: string // SHA256 hash for local files
  url?: string // Local file URL or YouTube URL
  duration?: number // Duration in seconds
  createdAt: Date
  updatedAt: Date
}

export interface Annotation {
  id: string
  videoId: string
  title: string
  description?: string
  startTime: number // Timestamp in seconds
  endTime?: number // Optional end time for segments
  collectionId?: string // Optional reference to parent collection
  order?: number // Order within collection (if part of one)
  createdAt: Date
  updatedAt: Date
}

export interface Collection {
  id: string
  videoId: string
  name: string
  description?: string
  metadata: Record<string, any> // Key-value pairs for collection metadata
  templateId?: string // Optional template applied to this collection
  annotationIds: string[] // Ordered list of annotation IDs
  createdAt: Date
  updatedAt: Date
}

export interface Template {
  id: string
  name: string
  description?: string
  keys: string[] // Metadata keys that can be applied to collections
  createdAt: Date
  updatedAt: Date
}

// Storage interface for middleware
export interface StorageAdapter {
  // Video operations
  createVideo(video: Omit<Video, "id" | "createdAt" | "updatedAt">): Promise<Video>
  getVideo(id: string): Promise<Video | null>
  getAllVideos(): Promise<Video[]>
  updateVideo(id: string, updates: Partial<Video>): Promise<Video>
  deleteVideo(id: string): Promise<void>

  // Annotation operations
  createAnnotation(annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt">): Promise<Annotation>
  getAnnotation(id: string): Promise<Annotation | null>
  getAnnotationsByVideo(videoId: string): Promise<Annotation[]>
  getUnassignedAnnotations(videoId: string): Promise<Annotation[]>
  updateAnnotation(id: string, updates: Partial<Annotation>): Promise<Annotation>
  deleteAnnotation(id: string): Promise<void>

  createCollection(collection: Omit<Collection, "id" | "createdAt" | "updatedAt">): Promise<Collection>
  getCollection(id: string): Promise<Collection | null>
  getCollectionsByVideo(videoId: string): Promise<Collection[]>
  updateCollection(id: string, updates: Partial<Collection>): Promise<Collection>
  deleteCollection(id: string): Promise<void>

  // Template operations
  createTemplate(template: Omit<Template, "id" | "createdAt" | "updatedAt">): Promise<Template>
  getTemplate(id: string): Promise<Template | null>
  getAllTemplates(): Promise<Template[]>
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template>
  deleteTemplate(id: string): Promise<void>
}
