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
 * Exports a complete snapshot of a video's data (video details, annotations, collections) to a JSON file.
 */
export function exportVideoDataAsJSON(video: Video, annotations: Annotation[], collections: Collection[]) {
  const filename = `${video.title.replace(/\s/g, "_")}_data.json`

  const exportData = {
    video: {
      ...video,
      // Include video source info
      source: video.videoId
        ? { type: "youtube", videoId: video.videoId, url: `https://www.youtube.com/watch?v=${video.videoId}` }
        : { type: "local", title: video.title, hash: video.hash },
    },
    collections: collections.map((col) => ({
      ...col,
      metadata: col.metadata,
      annotations: annotations.filter((ann) => ann.collectionId === col.id),
    })),
    // Include unassigned annotations
    unassignedAnnotations: annotations.filter((ann) => !ann.collectionId),
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(filename, jsonContent, "application/json")
}

/**
 * Converts collections and their annotations to a CSV string with video information.
 */
export function exportAnnotationsAsCSV(video: Video, annotations: Annotation[], collections: Collection[]) {
  if (annotations.length === 0 && collections.length === 0) {
    alert("No data to export.")
    return
  }

  const csvRows: string[] = []

  // Video information header
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
  csvRows.push("") // Empty line

  // Collections and their annotations
  csvRows.push("# Collections and Annotations")
  csvRows.push("")

  collections.forEach((collection) => {
    // Collection header
    csvRows.push(`## Collection: "${collection.name.replace(/"/g, '""')}"`)
    if (collection.description) {
      csvRows.push(`Description,"${collection.description.replace(/"/g, '""')}"`)
    }

    // Collection metadata
    if (Object.keys(collection.metadata).length > 0) {
      csvRows.push("### Metadata")
      Object.entries(collection.metadata).forEach(([key, value]) => {
        csvRows.push(`${key},"${value.replace(/"/g, '""')}"`)
      })
    }

    // Collection annotations
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
    csvRows.push("") // Empty line between collections
  })

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
  }

  const filename = `${video.title.replace(/\s/g, "_")}_export.csv`
  downloadFile(filename, csvRows.join("\n"), "text/csv")
}

/**
 * Imports annotations from a JSON file and adds them to a video.
 */
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

        // Support both old and new JSON export formats
        const importedAnnotations = Array.isArray(importedData) ? importedData : importedData.annotations

        if (!Array.isArray(importedAnnotations)) {
          throw new Error("Invalid JSON format: expected an array of annotations.")
        }

        let importedCount = 0
        for (const ann of importedAnnotations) {
          // Basic validation
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
