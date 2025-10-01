import type {
  StorageAdapter,
  Video,
  Annotation,
  Template,
  Collection,
} from "../types";

export class LocalStorageAdapter implements StorageAdapter {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getFromStorage<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Video operations
  async createVideo(
    video: Omit<Video, "id" | "createdAt" | "updatedAt">
  ): Promise<Video> {
    const newVideo: Video = {
      ...video,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const videos = this.getFromStorage<Video>("videos");
    videos.push(newVideo);
    this.saveToStorage("videos", videos);

    return newVideo;
  }

  async getVideo(id: string): Promise<Video | null> {
    const videos = this.getFromStorage<Video>("videos");
    return videos.find((v) => v.id === id) || null;
  }

  async getAllVideos(): Promise<Video[]> {
    return this.getFromStorage<Video>("videos");
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    const videos = this.getFromStorage<Video>("videos");
    const index = videos.findIndex((v) => v.id === id);

    if (index === -1) throw new Error("Video not found");

    videos[index] = { ...videos[index], ...updates, updatedAt: new Date() };
    this.saveToStorage("videos", videos);

    return videos[index];
  }

  async deleteVideo(id: string): Promise<void> {
    const videos = this.getFromStorage<Video>("videos");
    const filtered = videos.filter((v) => v.id !== id);
    this.saveToStorage("videos", filtered);

    // Also delete associated annotations and collections
    const annotations = this.getFromStorage<Annotation>("annotations");
    const filteredAnnotations = annotations.filter((a) => a.videoId !== id);
    this.saveToStorage("annotations", filteredAnnotations);

    const collections = this.getFromStorage<Collection>("collections");
    const filteredCollections = collections.filter((c) => c.videoId !== id);
    this.saveToStorage("collections", filteredCollections);
  }

  // Annotation operations
  async createAnnotation(
    annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt">
  ): Promise<Annotation> {
    const newAnnotation: Annotation = {
      ...annotation,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const annotations = this.getFromStorage<Annotation>("annotations");
    annotations.push(newAnnotation);
    this.saveToStorage("annotations", annotations);

    return newAnnotation;
  }

  async getAnnotation(id: string): Promise<Annotation | null> {
    const annotations = this.getFromStorage<Annotation>("annotations");
    return annotations.find((a) => a.id === id) || null;
  }

  async getAnnotationsByVideo(videoId: string): Promise<Annotation[]> {
    const annotations = this.getFromStorage<Annotation>("annotations");
    return annotations
      .filter((a) => a.videoId === videoId)
      .sort((a, b) => a.startTime - b.startTime);
  }

  async getUnassignedAnnotations(videoId: string): Promise<Annotation[]> {
    const annotations = this.getFromStorage<Annotation>("annotations");
    return annotations
      .filter((a) => a.videoId === videoId && !a.collectionId)
      .sort((a, b) => a.startTime - b.startTime);
  }

  async updateAnnotation(
    id: string,
    updates: Partial<Annotation>
  ): Promise<Annotation> {
    const annotations = this.getFromStorage<Annotation>("annotations");
    const index = annotations.findIndex((a) => a.id === id);

    if (index === -1) throw new Error("Annotation not found");

    annotations[index] = {
      ...annotations[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveToStorage("annotations", annotations);

    return annotations[index];
  }

  async deleteAnnotation(id: string): Promise<void> {
    const annotations = this.getFromStorage<Annotation>("annotations");
    const annotation = annotations.find((a) => a.id === id);

    if (annotation?.collectionId) {
      const collections = this.getFromStorage<Collection>("collections");
      const collection = collections.find(
        (c) => c.id === annotation.collectionId
      );
      if (collection) {
        collection.annotationIds = collection.annotationIds.filter(
          (aid) => aid !== id
        );
        this.saveToStorage("collections", collections);
      }
    }

    const filtered = annotations.filter((a) => a.id !== id);
    this.saveToStorage("annotations", filtered);
  }

  // Collection operations
  async createCollection(
    collection: Omit<Collection, "id" | "createdAt" | "updatedAt">
  ): Promise<Collection> {
    const newCollection: Collection = {
      ...collection,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collections = this.getFromStorage<Collection>("collections");
    collections.push(newCollection);
    this.saveToStorage("collections", collections);

    return newCollection;
  }

  async getCollection(id: string): Promise<Collection | null> {
    const collections = this.getFromStorage<Collection>("collections");
    return collections.find((c) => c.id === id) || null;
  }

  async getCollectionsByVideo(videoId: string): Promise<Collection[]> {
    const collections = this.getFromStorage<Collection>("collections");
    return collections.filter((c) => c.videoId === videoId);
  }

  async updateCollection(
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection> {
    const collections = this.getFromStorage<Collection>("collections");
    const index = collections.findIndex((c) => c.id === id);

    if (index === -1) throw new Error("Collection not found");

    collections[index] = {
      ...collections[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveToStorage("collections", collections);

    return collections[index];
  }

  async deleteCollection(id: string): Promise<void> {
    const collections = this.getFromStorage<Collection>("collections");
    const collection = collections.find((c) => c.id === id);

    // Remove collection reference from all its annotations
    if (collection) {
      const annotations = this.getFromStorage<Annotation>("annotations");
      collection.annotationIds.forEach((annotationId) => {
        const annotation = annotations.find((a) => a.id === annotationId);
        if (annotation) {
          annotation.collectionId = undefined;
          annotation.order = undefined;
        }
      });
      this.saveToStorage("annotations", annotations);
    }

    const filtered = collections.filter((c) => c.id !== id);
    this.saveToStorage("collections", filtered);
  }

  // Template operations
  async createTemplate(
    template: Omit<Template, "id" | "createdAt" | "updatedAt">
  ): Promise<Template> {
    const newTemplate: Template = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const templates = this.getFromStorage<Template>("templates");
    templates.push(newTemplate);
    this.saveToStorage("templates", templates);

    return newTemplate;
  }

  async getTemplate(id: string): Promise<Template | null> {
    const templates = this.getFromStorage<Template>("templates");
    return templates.find((t) => t.id === id) || null;
  }

  async getAllTemplates(): Promise<Template[]> {
    return this.getFromStorage<Template>("templates");
  }

  async updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Promise<Template> {
    const templates = this.getFromStorage<Template>("templates");
    const index = templates.findIndex((t) => t.id === id);

    if (index === -1) throw new Error("Template not found");

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveToStorage("templates", templates);

    return templates[index];
  }

  async deleteTemplate(id: string): Promise<void> {
    const templates = this.getFromStorage<Template>("templates");
    const filtered = templates.filter((t) => t.id !== id);
    this.saveToStorage("templates", filtered);
  }

  async applyTemplateToCollection(
    collectionId: string,
    templateId: string
  ): Promise<Collection> {
    const template = await this.getTemplate(templateId);
    if (!template) throw new Error("Template not found");

    const collection = await this.getCollection(collectionId);
    if (!collection) throw new Error("Collection not found");

    // Add template keys to metadata with empty values (don't overwrite existing keys)
    const updatedMetadata = { ...collection.metadata };
    template.keys.forEach((key) => {
      if (!(key in updatedMetadata)) {
        updatedMetadata[key] = "";
      }
    });

    return this.updateCollection(collectionId, { metadata: updatedMetadata });
  }
}
