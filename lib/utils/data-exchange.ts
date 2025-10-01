// lib/utils/data-exchange.ts

import type { Annotation, Collection, Video } from "@/lib/types";
import { storage } from "@/lib/storage";

/**
 * Triggers a browser download for the given content.
 */
function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports a complete snapshot of a video's data (video details, annotations, collections) to a JSON file.
 */
export function exportVideoDataAsJSON(
  video: Video,
  annotations: Annotation[],
  collections: Collection[]
) {
  const filename = `${video.title.replace(/\s/g, "_")}_data.json`;
  const exportData = {
    video,
    annotations,
    collections,
  };
  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(filename, jsonContent, "application/json");
}

/**
 * Converts an array of annotations to a CSV string, reflecting the correct Annotation type.
 */
export function exportAnnotationsAsCSV(
  annotations: Annotation[],
  videoTitle: string
) {
  if (annotations.length === 0) {
    alert("No annotations to export.");
    return;
  }

  const headers = [
    "id",
    "title",
    "description",
    "startTime",
    "endTime",
    "collectionId",
    "order",
  ];

  const csvRows = [
    headers.join(","), // Header row
    ...annotations.map((ann) => {
      const row = [
        ann.id,
        `"${ann.title.replace(/"/g, '""')}"`, // Escape quotes
        `"${(ann.description || "").replace(/"/g, '""')}"`,
        ann.startTime,
        ann.endTime ?? "",
        ann.collectionId ?? "",
        ann.order ?? "",
      ];
      return row.join(",");
    }),
  ];

  const filename = `${videoTitle.replace(/\s/g, "_")}_annotations.csv`;
  downloadFile(filename, csvRows.join("\n"), "text/csv");
}

/**
 * Imports annotations from a JSON file and adds them to a video.
 */
export async function importAnnotationsFromJSON(
  file: File,
  videoId: string
): Promise<{ success: boolean; count: number; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== "string") {
          throw new Error("Failed to read file content.");
        }
        const importedData = JSON.parse(content);

        // Support both old and new JSON export formats
        const importedAnnotations = Array.isArray(importedData)
          ? importedData
          : importedData.annotations;

        if (!Array.isArray(importedAnnotations)) {
          throw new Error(
            "Invalid JSON format: expected an array of annotations."
          );
        }

        let importedCount = 0;
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
            });
            importedCount++;
          }
        }

        resolve({ success: true, count: importedCount });
      } catch (e) {
        resolve({
          success: false,
          count: 0,
          error:
            (e as { message: string }).message ||
            "Failed to parse or import annotations.",
        });
      }
    };
    reader.onerror = () =>
      resolve({ success: false, count: 0, error: "Failed to read the file." });
    reader.readAsText(file);
  });
}
