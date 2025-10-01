import type { StorageAdapter } from "../types"
import { LocalStorageAdapter } from "./localStorage-adapter"

// Storage middleware that switches between adapters
class StorageMiddleware implements StorageAdapter {
  private adapter: StorageAdapter

  constructor() {
    this.adapter = new LocalStorageAdapter()

    // Forward all methods to the adapter, preserving 'this'
    this.createVideo = this.adapter.createVideo.bind(this.adapter)
    this.getVideo = this.adapter.getVideo.bind(this.adapter)
    this.getAllVideos = this.adapter.getAllVideos.bind(this.adapter)
    this.updateVideo = this.adapter.updateVideo.bind(this.adapter)
    this.deleteVideo = this.adapter.deleteVideo.bind(this.adapter)

    this.createAnnotation = this.adapter.createAnnotation.bind(this.adapter)
    this.getAnnotation = this.adapter.getAnnotation.bind(this.adapter)
    this.getAnnotationsByVideo = this.adapter.getAnnotationsByVideo.bind(this.adapter)
    this.updateAnnotation = this.adapter.updateAnnotation.bind(this.adapter)
    this.deleteAnnotation = this.adapter.deleteAnnotation.bind(this.adapter)

    this.createTemplate = this.adapter.createTemplate.bind(this.adapter)
    this.getTemplate = this.adapter.getTemplate.bind(this.adapter)
    this.getAllTemplates = this.adapter.getAllTemplates.bind(this.adapter)
    this.updateTemplate = this.adapter.updateTemplate.bind(this.adapter)
    this.deleteTemplate = this.adapter.deleteTemplate.bind(this.adapter)
  }

  // Video methods
  createVideo: StorageAdapter["createVideo"]
  getVideo: StorageAdapter["getVideo"]
  getAllVideos: StorageAdapter["getAllVideos"]
  updateVideo: StorageAdapter["updateVideo"]
  deleteVideo: StorageAdapter["deleteVideo"]

  // Annotation methods
  createAnnotation: StorageAdapter["createAnnotation"]
  getAnnotation: StorageAdapter["getAnnotation"]
  getAnnotationsByVideo: StorageAdapter["getAnnotationsByVideo"]
  updateAnnotation: StorageAdapter["updateAnnotation"]
  deleteAnnotation: StorageAdapter["deleteAnnotation"]

  // Template methods
  createTemplate: StorageAdapter["createTemplate"]
  getTemplate: StorageAdapter["getTemplate"]
  getAllTemplates: StorageAdapter["getAllTemplates"]
  updateTemplate: StorageAdapter["updateTemplate"]
  deleteTemplate: StorageAdapter["deleteTemplate"]
}

// Export singleton instance
export const storage = new StorageMiddleware()
