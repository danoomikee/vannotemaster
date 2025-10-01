// lib/utils/template-presets.ts

import type { Template } from "@/lib/types";
import { storage } from "@/lib/storage";

// Predefined template presets for common use cases
export const templatePresets: Omit<
  Template,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Scene Analysis",
    description: "Annotate scenes with location, setting, and mood information",
    keys: ["location", "setting_type", "scene_mood", "notes"],
  },
  {
    name: "Speaker Identification",
    description: "Track speakers and their dialogue in videos",
    keys: ["speaker_name", "speaker_role", "key_dialogue"],
  },
  {
    name: "Content Highlights",
    description: "Mark important moments and key takeaways",
    keys: ["highlight_type", "importance", "summary"],
  },
];

export async function initializePresetTemplates() {
  const existingTemplates = await storage.getAllTemplates();

  for (const preset of templatePresets) {
    const exists = existingTemplates.some((t) => t.name === preset.name);
    if (!exists) {
      try {
        await storage.createTemplate(preset);
        console.log(`[v0] Created preset template: ${preset.name}`);
      } catch (error) {
        console.error(
          `[v0] Failed to create preset template: ${preset.name}`,
          error
        );
      }
    }
  }
}
