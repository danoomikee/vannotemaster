// lib/utils/data-exchange.ts

import type { Annotation, Video } from "@/lib/types";
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
 * Exports an array of annotations to a JSON file.
 */
export function exportAnnotationsAsJSON(
  annotations: Annotation[],
  videoTitle: string
) {
  const filename = `${videoTitle.replace(/\s/g, "_")}_annotations.json`;
  const jsonContent = JSON.stringify(annotations, null, 2);
  downloadFile(filename, jsonContent, "application/json");
}

/**
 * Converts an array of annotations to a CSV string.
 */
export function exportAnnotationsAsCSV(
  annotations: Annotation[],
  videoTitle: string
) {
  if (annotations.length === 0) {
    alert("No annotations to export.");
    return;
  }

  // Find all unique metadata keys to create dynamic headers
  const metadataKeys = [
    ...new Set(annotations.flatMap((a) => Object.keys(a.metadata))),
  ];

  const headers = [
    "id",
    "title",
    "description",
    "startTime",
    "endTime",
    ...metadataKeys,
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
        ...metadataKeys.map(
          (key) =>
            `"${(ann.metadata[key] ?? "").toString().replace(/"/g, '""')}"`
        ),
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
        const importedAnnotations = JSON.parse(content);

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
              metadata: ann.metadata || {},
              templateId: ann.templateId,
            });
            importedCount++;
          }
        }

        resolve({ success: true, count: importedCount });
      } catch (e: any) {
        resolve({
          success: false,
          count: 0,
          error: e.message || "Failed to parse or import annotations.",
        });
      }
    };
    reader.onerror = () =>
      resolve({ success: false, count: 0, error: "Failed to read the file." });
    reader.readAsText(file);
  });
}
