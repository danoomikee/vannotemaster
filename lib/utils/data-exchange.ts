// lib/utils/data-exchange.ts

import type { Annotation, Collection, Video } from "@/lib/types"
import { storage } from "@/lib/storage"

/**
 * Triggers a browser download for the given content.
 */
function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Exports ALL application data (videos, collections, annotations, templates) to a JSON file.
 */
export async function exportAllDataAsJSON() {
  const videos = await storage.getAllVideos()
  const templates = await storage.getAllTemplates()

  // Collect all annotations and collections for all videos
  const allAnnotations: Annotation[] = []
  const allCollections: Collection[] = []

  for (const video of videos) {
    const videoAnnotations = await storage.getAnnotationsByVideo(video.id)
    const videoCollections = await storage.getCollectionsByVideo(video.id)
    allAnnotations.push(...videoAnnotations)
    allCollections.push(...videoCollections)
  }

  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    videos: videos.map((video) => ({
      ...video,
      // Include video source info
      source: video.videoId
        ? { type: "youtube", videoId: video.videoId, url: `https://www.youtube.com/watch?v=${video.videoId}` }
        : { type: "local", title: video.title, hash: video.hash },
    })),
    collections: allCollections.map((col) => ({
      ...col,
      metadata: col.metadata,
    })),
    annotations: allAnnotations,
    templates: templates,
  }

  const filename = `vannote_export_${new Date().toISOString().split("T")[0]}.json`
  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(filename, jsonContent, "application/json")
}

/**
 * Exports ALL application data to a CSV file with hierarchical structure.
 */
export async function exportAllDataAsCSV() {
  const videos = await storage.getAllVideos()
  const templates = await storage.getAllTemplates()

  if (videos.length === 0) {
    alert("No data to export.")
    return
  }

  const csvRows: string[] = []

  // Header
  csvRows.push("# VanNote Master Export")
  csvRows.push(`Export Date,${new Date().toISOString()}`)
  csvRows.push("")

  // Templates Section
  csvRows.push("# Templates")
  csvRows.push("")
  templates.forEach((template) => {
    csvRows.push(`## Template: "${template.name.replace(/"/g, '""')}"`)
    if (template.description) {
      csvRows.push(`Description,"${template.description.replace(/"/g, '""')}"`)
    }
    csvRows.push("### Fields")
    csvRows.push("Key,Type,Required")
    template.keys.forEach((key) => {
      csvRows.push(`"${key.key.replace(/"/g, '""')}",${key.type},${key.required ? "Yes" : "No"}`)
    })
    csvRows.push("")
  })

  // Videos Section
  for (const video of videos) {
    csvRows.push("# Video")
    csvRows.push("")

    // Video information
    if (video.videoId) {
      csvRows.push(`Video Type,YouTube`)
      csvRows.push(`Video ID,${video.videoId}`)
      csvRows.push(`Video URL,https://www.youtube.com/watch?v=${video.videoId}`)
    } else {
      csvRows.push(`Video Type,Local File`)
      csvRows.push(`Video Title,"${video.title.replace(/"/g, '""')}"`)
      csvRows.push(`Video Hash,${video.hash || "N/A"}`)
    }
    csvRows.push(`Video Duration,${video.duration || "N/A"}`)
    csvRows.push(`Created At,${video.createdAt}`)
    csvRows.push("")

    const annotations = await storage.getAnnotationsByVideo(video.id)
    const collections = await storage.getCollectionsByVideo(video.id)

    // Collections and their annotations
    if (collections.length > 0) {
      csvRows.push("## Collections")
      csvRows.push("")

      collections.forEach((collection) => {
        csvRows.push(`### Collection: "${collection.name.replace(/"/g, '""')}"`)
        if (collection.description) {
          csvRows.push(`Description,"${collection.description.replace(/"/g, '""')}"`)
        }

        // Collection metadata
        if (Object.keys(collection.metadata).length > 0) {
          csvRows.push("#### Metadata")
          Object.entries(collection.metadata).forEach(([key, value]) => {
            csvRows.push(`${key},"${value.replace(/"/g, '""')}"`)
          })
        }

        // Collection annotations
        const collectionAnnotations = annotations.filter((ann) => ann.collectionId === collection.id)
        if (collectionAnnotations.length > 0) {
          csvRows.push("#### Annotations")
          csvRows.push("ID,Title,Description,Start Time,End Time,Order")
          collectionAnnotations.forEach((ann) => {
            csvRows.push(
              [
                ann.id,
                `"${ann.title.replace(/"/g, '""')}"`,
                `"${(ann.description || "").replace(/"/g, '""')}"`,
                ann.startTime,
                ann.endTime ?? "",
                ann.order ?? "",
              ].join(","),
            )
          })
        }
        csvRows.push("")
      })
    }

    // Unassigned annotations
    const unassignedAnnotations = annotations.filter((ann) => !ann.collectionId)
    if (unassignedAnnotations.length > 0) {
      csvRows.push("## Unassigned Annotations")
      csvRows.push("ID,Title,Description,Start Time,End Time")
      unassignedAnnotations.forEach((ann) => {
        csvRows.push(
          [
            ann.id,
            `"${ann.title.replace(/"/g, '""')}"`,
            `"${(ann.description || "").replace(/"/g, '""')}"`,
            ann.startTime,
            ann.endTime ?? "",
          ].join(","),
        )
      })
      csvRows.push("")
    }

    csvRows.push("---") // Separator between videos
    csvRows.push("")
  }

  const filename = `vannote_export_${new Date().toISOString().split("T")[0]}.csv`
  downloadFile(filename, csvRows.join("\n"), "text/csv")
}

/**
 * Imports data from a JSON file and intelligently merges with existing data.
 * Updates pre-existing videos (matched by videoId or hash) and adds new data.
 */
export async function importAllDataFromJSON(file: File): Promise<{
  success: boolean
  message: string
  details?: { videos: number; collections: number; annotations: number; templates: number }
}> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result
        if (typeof content !== "string") {
          throw new Error("Failed to read file content.")
        }
        const importedData = JSON.parse(content)

        // Validate structure
        if (!importedData.videos || !Array.isArray(importedData.videos)) {
          throw new Error("Invalid JSON format: expected videos array.")
        }

        let videosProcessed = 0
        let collectionsProcessed = 0
        let annotationsProcessed = 0
        let templatesProcessed = 0

        // Import templates first
        if (importedData.templates && Array.isArray(importedData.templates)) {
          for (const template of importedData.templates) {
            const existingTemplates = await storage.getAllTemplates()
            const existing = existingTemplates.find((t) => t.name === template.name)

            if (existing) {
              // Update existing template
              await storage.updateTemplate(existing.id, {
                name: template.name,
                description: template.description,
                keys: template.keys,
              })
            } else {
              // Create new template
              await storage.createTemplate({
                name: template.name,
                description: template.description,
                keys: template.keys,
              })
            }
            templatesProcessed++
          }
        }

        // Process each video
        for (const videoData of importedData.videos) {
          let videoId: string | null = null
          const existingVideos = await storage.getAllVideos()

          // Try to find existing video by videoId (YouTube) or hash (local file)
          const existingVideo = existingVideos.find((v) => {
            if (videoData.videoId && v.videoId) {
              return v.videoId === videoData.videoId
            }
            if (videoData.hash && v.hash) {
              return v.hash === videoData.hash
            }
            return false
          })

          if (existingVideo) {
            // Update existing video
            videoId = existingVideo.id
            await storage.updateVideo(videoId, {
              title: videoData.title,
              description: videoData.description,
              duration: videoData.duration,
            })
          } else {
            // Create new video
            const newVideo = await storage.createVideo({
              title: videoData.title,
              url: videoData.url || "",
              videoId: videoData.videoId,
              hash: videoData.hash,
              description: videoData.description,
              duration: videoData.duration,
            })
            videoId = newVideo.id
          }
          videosProcessed++

          // Import collections for this video
          const videoCollections = importedData.collections?.filter((c: Collection) => c.videoId === videoData.id) || []
          const collectionIdMap = new Map<string, string>() // old ID -> new ID

          for (const collectionData of videoCollections) {
            const newCollection = await storage.createCollection({
              videoId: videoId,
              name: collectionData.name,
              description: collectionData.description,
              metadata: collectionData.metadata || {},
              annotationIds: [], // Will be populated when annotations are imported
            })
            collectionIdMap.set(collectionData.id, newCollection.id)
            collectionsProcessed++
          }

          // Import annotations for this video
          const videoAnnotations = importedData.annotations?.filter((a: Annotation) => a.videoId === videoData.id) || []
          const annotationIdMap = new Map<string, string>() // old ID -> new ID

          for (const annotationData of videoAnnotations) {
            const newCollectionId = annotationData.collectionId
              ? collectionIdMap.get(annotationData.collectionId)
              : undefined

            const newAnnotation = await storage.createAnnotation({
              videoId: videoId,
              title: annotationData.title,
              description: annotationData.description,
              startTime: annotationData.startTime,
              endTime: annotationData.endTime,
              collectionId: newCollectionId,
              order: annotationData.order,
            })
            annotationIdMap.set(annotationData.id, newAnnotation.id)
            annotationsProcessed++

            // Update collection's annotationIds
            if (newCollectionId) {
              const collection = await storage.getCollection(newCollectionId)
              if (collection) {
                await storage.updateCollection(newCollectionId, {
                  annotationIds: [...collection.annotationIds, newAnnotation.id],
                })
              }
            }
          }
        }

        resolve({
          success: true,
          message: "Import completed successfully",
          details: {
            videos: videosProcessed,
            collections: collectionsProcessed,
            annotations: annotationsProcessed,
            templates: templatesProcessed,
          },
        })
      } catch (e) {
        resolve({
          success: false,
          message: (e as { message: string }).message || "Failed to parse or import data.",
        })
      }
    }
    reader.onerror = () => resolve({ success: false, message: "Failed to read the file." })
    reader.readAsText(file)
  })
}

// Legacy functions for backward compatibility (video-specific exports)
export function exportVideoDataAsJSON(video: Video, annotations: Annotation[], collections: Collection[]) {
  const filename = `${video.title.replace(/\s/g, "_")}_data.json`

  const exportData = {
    video: {
      ...video,
      source: video.videoId
        ? { type: "youtube", videoId: video.videoId, url: `https://www.youtube.com/watch?v=${video.videoId}` }
        : { type: "local", title: video.title, hash: video.hash },
    },
    collections: collections.map((col) => ({
      ...col,
      metadata: col.metadata,
      annotations: annotations.filter((ann) => ann.collectionId === col.id),
    })),
    unassignedAnnotations: annotations.filter((ann) => !ann.collectionId),
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(filename, jsonContent, "application/json")
}

export function exportAnnotationsAsCSV(video: Video, annotations: Annotation[], collections: Collection[]) {
  if (annotations.length === 0 && collections.length === 0) {
    alert("No data to export.")
    return
  }

  const csvRows: string[] = []

  csvRows.push("# Video Information")
  if (video.videoId) {
    csvRows.push(`Video Type,YouTube`)
    csvRows.push(`Video ID,${video.videoId}`)
    csvRows.push(`Video URL,https://www.youtube.com/watch?v=${video.videoId}`)
  } else {
    csvRows.push(`Video Type,Local File`)
    csvRows.push(`Video Title,"${video.title.replace(/"/g, '""')}"`)
    csvRows.push(`Video Hash,${video.hash || "N/A"}`)
  }
  csvRows.push(`Video Duration,${video.duration || "N/A"}`)
  csvRows.push("")

  csvRows.push("# Collections and Annotations")
  csvRows.push("")

  collections.forEach((collection) => {
    csvRows.push(`## Collection: "${collection.name.replace(/"/g, '""')}"`)
    if (collection.description) {
      csvRows.push(`Description,"${collection.description.replace(/"/g, '""')}"`)
    }

    if (Object.keys(collection.metadata).length > 0) {
      csvRows.push("### Metadata")
      Object.entries(collection.metadata).forEach(([key, value]) => {
        csvRows.push(`${key},"${value.replace(/"/g, '""')}"`)
      })
    }

    const collectionAnnotations = annotations.filter((ann) => ann.collectionId === collection.id)
    if (collectionAnnotations.length > 0) {
      csvRows.push("### Annotations")
      csvRows.push("ID,Title,Description,Start Time,End Time,Order")
      collectionAnnotations.forEach((ann) => {
        csvRows.push(
          [
            ann.id,
            `"${ann.title.replace(/"/g, '""')}"`,
            `"${(ann.description || "").replace(/"/g, '""')}"`,
            ann.startTime,
            ann.endTime ?? "",
            ann.order ?? "",
          ].join(","),
        )
      })
    }
    csvRows.push("")
  })

  const unassignedAnnotations = annotations.filter((ann) => !ann.collectionId)
  if (unassignedAnnotations.length > 0) {
    csvRows.push("## Unassigned Annotations")
    csvRows.push("ID,Title,Description,Start Time,End Time")
    unassignedAnnotations.forEach((ann) => {
      csvRows.push(
        [
          ann.id,
          `"${ann.title.replace(/"/g, '""')}"`,
          `"${(ann.description || "").replace(/"/g, '""')}"`,
          ann.startTime,
          ann.endTime ?? "",
        ].join(","),
      )
    })
  }

  const filename = `${video.title.replace(/\s/g, "_")}_export.csv`
  downloadFile(filename, csvRows.join("\n"), "text/csv")
}

export async function importAnnotationsFromJSON(
  file: File,
  videoId: string,
): Promise<{ success: boolean; count: number; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result
        if (typeof content !== "string") {
          throw new Error("Failed to read file content.")
        }
        const importedData = JSON.parse(content)

        const importedAnnotations = Array.isArray(importedData) ? importedData : importedData.annotations

        if (!Array.isArray(importedAnnotations)) {
          throw new Error("Invalid JSON format: expected an array of annotations.")
        }

        let importedCount = 0
        for (const ann of importedAnnotations) {
          if (ann.title && typeof ann.startTime === "number") {
            await storage.createAnnotation({
              videoId: videoId,
              title: ann.title,
              description: ann.description,
              startTime: ann.startTime,
              endTime: ann.endTime,
              collectionId: ann.collectionId,
              order: ann.order,
            })
            importedCount++
          }
        }

        resolve({ success: true, count: importedCount })
      } catch (e) {
        resolve({
          success: false,
          count: 0,
          error: (e as { message: string }).message || "Failed to parse or import annotations.",
        })
      }
    }
    reader.onerror = () => resolve({ success: false, count: 0, error: "Failed to read the file." })
    reader.readAsText(file)
  })
}
