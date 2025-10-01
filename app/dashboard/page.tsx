"use client";

import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import type { VideoPlayerHandle } from "@/components/video-player";
import { VideoUpload } from "@/components/video-upload";
import { AnnotationModal } from "@/components/annotation-modal";
import { QuickAnnotationBar } from "@/components/quick-annotation-bar";
import type { Video, Annotation, Template, Collection } from "@/lib/types";
import { storage } from "@/lib/storage";
import { initializePresetTemplates } from "@/lib/utils/template-presets";
import {
  FileVideo,
  Plus,
  LayoutTemplate,
  Keyboard,
  FolderPlus,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateForm } from "@/components/template-form";
import { useHotkeys } from "react-hotkeys-hook";
import { EndTimeModal } from "@/components/end-time-modal";
import { ShortcutsModal } from "@/components/shortcuts-modal";
import { AnnotationSearchModal } from "@/components/annotation-search-modal";

import {
  exportAnnotationsAsCSV,
  exportVideoDataAsJSON,
  importAnnotationsFromJSON,
} from "@/lib/utils/data-exchange";
import { toast } from "sonner";
import { VideoEditModal } from "@/components/video-edit-modal";
import { CollectionModal } from "@/components/collection-modal";
import { CollectionDetailView } from "@/components/collection-detail-view";
import { AddAnnotationsToCollectionModal } from "@/components/add-annotations-to-collection-modal";
import { useEffect, useRef, useState } from "react";

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState("");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  // Modal states
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [showAnnotationSearch, setShowAnnotationSearch] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [showAddAnnotationsModal, setShowAddAnnotationsModal] = useState(false);
  // const [targetCollection, setTargetCollection] = useState<Collection | null>(
  //   null
  // );
  const lastOpenedCollectionRef = useRef<string | null>(null);

  const [showVideoEditModal, setShowVideoEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Editing states
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(
    null
  );
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Refs for direct element control
  const videoRef = useRef<VideoPlayerHandle>(null);
  const quickAnnotationInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const shouldResumeRef = useRef(false);

  useEffect(() => {
    loadTemplates();
    loadVideos();
    initializePresetTemplates().catch(console.error);
  }, []);

  useEffect(() => {
    if (currentVideo) {
      loadAnnotations(currentVideo.id);
      loadCollections(currentVideo.id);
    } else {
      setAnnotations([]);
      setCollections([]);
    }
  }, [currentVideo]);

  useEffect(() => {
    if (selectedCollection) {
      lastOpenedCollectionRef.current = selectedCollection.id;
    }
  }, [selectedCollection]);

  const loadVideos = async () => {
    const allVideos = await storage.getAllVideos();
    setVideos(allVideos);
  };

  const loadAnnotations = async (videoId: string) => {
    const videoAnnotations = await storage.getAnnotationsByVideo(videoId);
    setAnnotations(videoAnnotations.sort((a, b) => a.startTime - b.startTime));
  };

  const loadCollections = async (videoId: string) => {
    const videoCollections = await storage.getCollectionsByVideo(videoId);
    setCollections(videoCollections);
  };

  const loadTemplates = async () => {
    const allTemplates = await storage.getAllTemplates();
    setTemplates(allTemplates);
  };

  // --- Hotkey Handlers ---
  const handlePauseAndResume = (callback: () => void) => {
    if (!videoRef.current) return;
    if (!videoRef.current.isPaused()) {
      shouldResumeRef.current = true;
      videoRef.current.pause();
    } else {
      shouldResumeRef.current = false;
    }
    callback();
  };

  const resumePlaybackIfNeeded = () => {
    if (shouldResumeRef.current && videoRef.current) {
      videoRef.current.play();
      shouldResumeRef.current = false;
    }
  };

  const handleToggleCollectionSidebar = () => {
    if (!currentVideo || collections.length === 0) return;

    if (selectedCollection) {
      // Close sidebar
      setSelectedCollection(null);
    } else {
      // Open sidebar with last opened collection or first available
      const collectionToOpen =
        collections.find((c) => c.id === lastOpenedCollectionRef.current) ||
        collections[0];
      setSelectedCollection(collectionToOpen);
    }
  };

  const handleNextCollection = () => {
    if (!currentVideo || collections.length === 0) return;

    if (!selectedCollection) {
      // If no collection is selected, open the first one
      setSelectedCollection(collections[0]);
      return;
    }

    const currentIndex = collections.findIndex(
      (c) => c.id === selectedCollection.id
    );
    const nextIndex = (currentIndex + 1) % collections.length;
    setSelectedCollection(collections[nextIndex]);
  };

  const handlePreviousCollection = () => {
    if (!currentVideo || collections.length === 0) return;

    if (!selectedCollection) {
      // If no collection is selected, open the last one
      setSelectedCollection(collections[collections.length - 1]);
      return;
    }

    const currentIndex = collections.findIndex(
      (c) => c.id === selectedCollection.id
    );
    const prevIndex =
      (currentIndex - 1 + collections.length) % collections.length;
    setSelectedCollection(collections[prevIndex]);
  };

  // Hotkeys
  useHotkeys(
    "shift+m",
    (event) => {
      event.preventDefault();
      handlePauseAndResume(handleDetailedAnnotate);
    },
    { enabled: !!currentVideo }
  );
  useHotkeys(
    "m",
    (event) => {
      event.preventDefault();
      handlePauseAndResume(() => quickAnnotationInputRef.current?.focus());
    },
    {
      enabled: !!currentVideo,
    }
  );
  useHotkeys(
    "e",
    (event) => {
      event.preventDefault();
      handlePauseAndResume(() => setShowEndTimeModal(true));
    },
    {
      enabled: !!currentVideo,
    }
  );
  useHotkeys(
    "arrowleft",
    (event) => {
      event.preventDefault();

      if (!videoRef.current) return;
      const newTime = videoRef.current.getCurrentTime() - 5;
      videoRef.current.seek(newTime);
    },
    { enabled: !!currentVideo }
  );
  useHotkeys(
    "arrowright",
    (event) => {
      event.preventDefault();

      if (!videoRef.current) return;
      const newTime = videoRef.current.getCurrentTime() + 5;
      videoRef.current.seek(newTime);
    },
    { enabled: !!currentVideo }
  );
  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      if (!videoRef.current) return;
      if (videoRef.current.isPaused()) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    },
    { enabled: !!currentVideo }
  );

  useHotkeys(
    "s",
    () => {
      // Seek to Previous
      const prevAnnotation = [...annotations]
        .reverse()
        .find((a) => a.startTime < currentTime);
      if (prevAnnotation && videoRef.current)
        videoRef.current.seek(prevAnnotation.startTime);
    },
    { enabled: !!currentVideo }
  );

  useHotkeys(
    "d",
    () => {
      // Seek to Next
      const nextAnnotation = annotations.find((a) => a.startTime > currentTime);
      if (nextAnnotation && videoRef.current)
        videoRef.current.seek(nextAnnotation.startTime);
    },
    { enabled: !!currentVideo }
  );

  useHotkeys(
    "escape",
    () => {
      // Resume and unfocus
      if (videoRef.current?.isPaused()) {
        videoRef.current?.play();
        quickAnnotationInputRef.current?.blur();
      }
    },
    { enabled: !!currentVideo }
  );

  useHotkeys("k", (e) => {
    e.preventDefault();
    if (currentVideo) {
      if (videoRef.current && !videoRef.current.isPaused()) {
        videoRef.current.pause();
      }
      setShowAnnotationSearch(true);
    }
  });

  useHotkeys(
    "c",
    (e) => {
      e.preventDefault();
      handleToggleCollectionSidebar();
    },
    {
      enabled: !!currentVideo && collections.length > 0,
    }
  );

  useHotkeys(
    "shift+c",
    (e) => {
      e.preventDefault();
      setShowAddAnnotationsModal(true);
    },
    {
      enabled: !!currentVideo && collections.length > 0,
    }
  );

  useHotkeys(
    "shift+arrowright",
    (e) => {
      e.preventDefault();
      handleNextCollection();
    },
    {
      enabled: !!currentVideo && collections.length > 0,
    }
  );

  useHotkeys(
    "shift+arrowleft",
    (e) => {
      e.preventDefault();
      handlePreviousCollection();
    },
    {
      enabled: !!currentVideo && collections.length > 0,
    }
  );

  useHotkeys("?", (e) => {
    e.preventDefault();
    setShowShortcutsModal(true);
  });

  // --- Event Handlers ---
  const handleVideoAdded = async (videoId: string) => {
    await loadVideos();
    const video = await storage.getVideo(videoId);
    if (video) {
      setCurrentVideo(video);
      setShowVideoUpload(false);
    }
  };

  const handleVideoUpdate = async (
    videoId: string,
    data: Partial<Omit<Video, "id">>
  ) => {
    const updatedVideo = await storage.updateVideo(videoId, data);
    setVideos(videos.map((v) => (v.id === videoId ? updatedVideo : v)));
    if (currentVideo?.id === videoId) {
      setCurrentVideo(updatedVideo);
    }
    setShowVideoEditModal(false);
    setEditingVideo(null);
    toast.success("Video details updated successfully.");
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setShowVideoEditModal(true);
  };

  const handleVideoDelete = async (videoId: string) => {
    try {
      await storage.deleteVideo(videoId);
      if (currentVideo?.id === videoId) {
        setCurrentVideo(null);
      }
      await loadVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedCollection(null);

    // If the video is from YouTube, it has a persistent URL.
    if (video.videoId) {
      setCurrentVideo(video);
      return;
    }

    // Otherwise, it's a local file. We must prompt the user to select it again
    // to get a valid URL for the current browser session.
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const updatedVideo = { ...video, url };
        // We can optionally update storage with the new temporary URL
        await storage.updateVideo(video.id, { url });
        setCurrentVideo(updatedVideo);
        setVideos((prevVideos) =>
          prevVideos.map((v) => (v.id === video.id ? updatedVideo : v))
        );
      }
    };
    input.click();
  };

  const handleQuickAnnotate = async (title: string) => {
    if (!currentVideo) return;
    const annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt"> = {
      videoId: currentVideo.id,
      title,
      startTime: currentTime,
    };
    await storage.createAnnotation(annotation);
    await loadAnnotations(currentVideo.id);
    resumePlaybackIfNeeded();
  };

  const handleDetailedAnnotate = () => {
    if (!currentVideo) return;
    setEditingAnnotation(null);
    setShowAnnotationModal(true);
  };

  const handleEditAnnotation = (annotation: Annotation) => {
    videoRef.current?.pause(); // Pause video on edit
    setEditingAnnotation(annotation);
    setShowAnnotationModal(true);
  };

  const handleAnnotationSave = async (data: Partial<Annotation>) => {
    if (!currentVideo) return;
    try {
      if (editingAnnotation) {
        await storage.updateAnnotation(editingAnnotation.id, data);
      } else {
        const newAnnotation: Omit<
          Annotation,
          "id" | "createdAt" | "updatedAt"
        > = {
          videoId: currentVideo.id,
          title: data.title || "",
          description: data.description,
          startTime: data.startTime ?? currentTime,
          endTime: data.endTime,
        };
        await storage.createAnnotation(newAnnotation);
      }
      await loadAnnotations(currentVideo.id);
      setShowAnnotationModal(false);
      setEditingAnnotation(null);
      resumePlaybackIfNeeded();
    } catch (error) {
      console.error("Error saving annotation:", error);
    }
  };

  const handleMarkEndTime = async (annotationId: string) => {
    if (!currentVideo) return;
    await storage.updateAnnotation(annotationId, { endTime: currentTime });
    await loadAnnotations(currentVideo.id);
    resumePlaybackIfNeeded();
  };

  const handleAnnotationDeleted = async (annotationId: string) => {
    try {
      await storage.deleteAnnotation(annotationId);
      if (currentVideo) {
        await loadAnnotations(currentVideo.id);
        await loadCollections(currentVideo.id);
      }
    } catch (error) {
      console.error("Error deleting annotation:", error);
    }
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    if (videoRef.current) {
      videoRef.current.seek(annotation.startTime);
    }
  };

  const handleCreateCollection = () => {
    setEditingCollection(null);
    setShowCollectionModal(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setShowCollectionModal(true);
  };

  const handleCollectionSave = async (data: Partial<Collection>) => {
    if (!currentVideo) return;
    try {
      if (selectedCollection) {
        await storage.updateCollection(selectedCollection.id, data);
      } else {
        const newCollection: Omit<
          Collection,
          "id" | "createdAt" | "updatedAt"
        > = {
          videoId: currentVideo.id,
          name: data.name || "",
          description: data.description,
          metadata: data.metadata || {},
          annotationIds: [],
        };
        await storage.createCollection(newCollection);
      }
      await loadCollections(currentVideo.id);
      setShowCollectionModal(false);
      setEditingCollection(null);
      toast.success(
        editingCollection ? "Collection updated" : "Collection created"
      );
    } catch (error) {
      console.error("Error saving collection:", error);
      toast.error("Failed to save collection");
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await storage.deleteCollection(collectionId);
      if (currentVideo) {
        await loadCollections(currentVideo.id);
        await loadAnnotations(currentVideo.id);
      }
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
      toast.success("Collection deleted");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    }
  };

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection);
  };

  const handleAddAnnotationsToCollection = () => {
    // collection: Collection
    // setTargetCollection(collection);
    setShowAddAnnotationsModal(true);
  };

  const handleAddAnnotationToCollection = async (
    annotationId: string,
    collectionId: string
  ) => {
    try {
      const collection = collections.find((c) => c.id === collectionId);
      if (!collection) return;

      // Update annotation with collection reference
      await storage.updateAnnotation(annotationId, {
        collectionId,
        order: collection.annotationIds.length,
      });

      // Update collection with new annotation
      const updatedAnnotationIds = [...collection.annotationIds, annotationId];
      await storage.updateCollection(collectionId, {
        annotationIds: updatedAnnotationIds,
      });

      // Reload data
      if (currentVideo) {
        await loadAnnotations(currentVideo.id);
        await loadCollections(currentVideo.id);
      }

      toast.success("Annotation added to collection");
    } catch (error) {
      console.error("Error adding annotation to collection:", error);
      toast.error("Failed to add annotation");
    }
  };

  const handleRemoveAnnotationFromCollection = async (
    collectionId: string,
    annotationId: string
  ) => {
    try {
      const collection = collections.find((c) => c.id === collectionId);
      if (!collection) return;

      // Remove annotation from collection
      const updatedAnnotationIds = collection.annotationIds.filter(
        (id) => id !== annotationId
      );
      await storage.updateCollection(collectionId, {
        annotationIds: updatedAnnotationIds,
      });

      // Update annotation to remove collection reference
      await storage.updateAnnotation(annotationId, {
        collectionId: undefined,
        order: undefined,
      });

      // Reload data
      if (currentVideo) {
        await loadAnnotations(currentVideo.id);
        await loadCollections(currentVideo.id);
      }

      toast.success("Annotation removed from collection");
    } catch (error) {
      console.error("Error removing annotation from collection:", error);
      toast.error("Failed to remove annotation");
    }
  };

  const handleReorderAnnotations = async (
    collectionId: string,
    annotationIds: string[]
  ) => {
    try {
      await storage.updateCollection(collectionId, { annotationIds });

      // Update order property on each annotation
      for (let i = 0; i < annotationIds.length; i++) {
        await storage.updateAnnotation(annotationIds[i], { order: i });
      }

      if (currentVideo) {
        await loadCollections(currentVideo.id);
      }
    } catch (error) {
      console.error("Error reordering annotations:", error);
    }
  };

  const handleTemplateEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  const handleTemplateDelete = async (templateId: string) => {
    try {
      await storage.deleteTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleTemplateSave = async (
    template: Omit<Template, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingTemplate) {
        await storage.updateTemplate(editingTemplate.id, template);
      } else {
        await storage.createTemplate(template);
      }
      await loadTemplates();
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  // search modal
  const handleSearchModalOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      videoRef.current?.play();
    }
    setShowAnnotationSearch(isOpen);
  };

  const handleSelectAnnotationForEditing = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setShowAnnotationModal(true);
  };

  // Export / Import Handlers

  const handleExport = (format: "json" | "csv") => {
    if (!currentVideo) return;
    if (format === "json") {
      exportVideoDataAsJSON(currentVideo, annotations, collections);
    } else {
      exportAnnotationsAsCSV(currentVideo, annotations, collections);
    }
  };

  const handleImport = () => {
    importFileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentVideo) return;

    const result = await importAnnotationsFromJSON(file, currentVideo.id);

    if (result.success) {
      toast.success("Import Successful", {
        description: `Successfully imported ${result.count} annotations.`,
      });
      // Refresh annotations
      const videoAnnotations = await storage.getAnnotationsByVideo(
        currentVideo.id
      );
      setAnnotations(videoAnnotations);
    } else {
      toast.warning("Import Failed", {
        description: result.error || "An unknown error occurred.",
      });
    }

    // Reset file input
    if (event.target) event.target.value = "";
  };

  const unassignedAnnotations = annotations.filter((a) => !a.collectionId);

  const selectedCollectionAnnotations = selectedCollection
    ? selectedCollection.annotationIds
        .map((id) => annotations.find((a) => a.id === id))
        .filter((a): a is Annotation => a !== undefined)
    : [];

  return (
    <SidebarProvider>
      <AppSidebar
        videos={videos}
        annotations={annotations}
        collections={collections}
        templates={templates}
        currentVideo={currentVideo}
        selectedCollection={selectedCollection}
        onVideoSelect={handleVideoSelect}
        onEditVideo={handleEditVideo}
        onAnnotationClick={handleAnnotationClick}
        onEditAnnotation={handleEditAnnotation}
        onDeleteAnnotation={handleAnnotationDeleted}
        onSelectCollection={handleSelectCollection}
        onEditCollection={handleEditCollection}
        onDeleteCollection={handleDeleteCollection}
        onCreateCollection={handleCreateCollection}
        onEditTemplate={handleTemplateEdit}
        onDeleteTemplate={handleTemplateDelete}
        onCreateVideo={() => setShowVideoUpload(true)}
        onDeleteVideo={handleVideoDelete}
        onCreateTemplate={() => {
          setEditingTemplate(null);
          setShowTemplateModal(true);
        }}
        filter={filter}
        onFilterChange={setFilter}
        onExportAnnotations={handleExport}
        onImportAnnotations={handleImport}
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="bg-background sticky top-0 flex h-12 shrink-0 items-center gap-2 border-b px-4 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">VanNote</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate max-w-[200px]">
                  {currentVideo ? currentVideo.title : "Dashboard"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            {!currentVideo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideoUpload(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Upload Video
              </Button>
            )}
            {currentVideo && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateCollection}
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                New Collection
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcutsModal(true)}
            >
              <Keyboard className="h-4 w-4 mr-1" />
              Shortcuts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
            >
              <LayoutTemplate className="h-4 w-4 mr-1" />
              Templates
            </Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          {currentVideo ? (
            <>
              <div className="flex-1 min-h-0 flex overflow-hidden">
                <div className="flex-1 flex flex-col">
                  <VideoPlayer
                    ref={videoRef}
                    src={currentVideo.url}
                    youtubeId={currentVideo.videoId}
                    annotations={annotations}
                    onTimeUpdate={setCurrentTime}
                    onAnnotationClick={handleAnnotationClick}
                    className="flex-1"
                  />

                  <QuickAnnotationBar
                    ref={quickAnnotationInputRef}
                    currentTime={currentTime}
                    onQuickAnnotate={handleQuickAnnotate}
                    onDetailedAnnotate={() =>
                      handlePauseAndResume(handleDetailedAnnotate)
                    }
                    disabled={!currentVideo}
                  />
                </div>

                {selectedCollection && (
                  <div className="w-80 border-l bg-background">
                    <CollectionDetailView
                      collection={selectedCollection}
                      annotations={selectedCollectionAnnotations}
                      templates={templates}
                      collections={collections}
                      onBack={() => setSelectedCollection(null)}
                      onEdit={handleEditCollection}
                      onAddAnnotations={handleAddAnnotationsToCollection}
                      onAnnotationClick={handleAnnotationClick}
                      onRemoveAnnotation={handleRemoveAnnotationFromCollection}
                      onReorderAnnotations={handleReorderAnnotations}
                      onCollectionChange={setSelectedCollection}
                      onSave={handleCollectionSave}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
              <div className="max-w-2xl w-full text-center">
                <FileVideo className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to VanNote
                </h2>
                <p className="text-muted-foreground mb-6">
                  Create timestamp labels and segments on videos with
                  customizable templates for structured annotation data.
                </p>

                <Button size="lg" onClick={() => setShowVideoUpload(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Upload Your First Video
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input for imports */}
        <input
          type="file"
          ref={importFileInputRef}
          onChange={handleFileImport}
          className="hidden"
          accept="application/json"
        />

        <ShortcutsModal
          open={showShortcutsModal}
          onOpenChange={setShowShortcutsModal}
        />

        <VideoEditModal
          open={showVideoEditModal}
          onOpenChange={setShowVideoEditModal}
          video={editingVideo}
          onSave={handleVideoUpdate}
        />

        <EndTimeModal
          open={showEndTimeModal}
          onOpenChange={setShowEndTimeModal}
          annotations={annotations}
          onMarkEnd={handleMarkEndTime}
          currentTime={currentTime}
        />

        <AnnotationModal
          open={showAnnotationModal}
          onOpenChange={setShowAnnotationModal}
          annotation={editingAnnotation}
          templates={templates}
          onSave={handleAnnotationSave}
          defaultStartTime={currentTime}
        />

        <AnnotationSearchModal
          open={showAnnotationSearch}
          onOpenChange={handleSearchModalOpenChange}
          annotations={annotations}
          onSelectAnnotation={handleSelectAnnotationForEditing}
        />

        <CollectionModal
          open={showCollectionModal}
          onOpenChange={setShowCollectionModal}
          collection={editingCollection}
          templates={templates}
          videoId={currentVideo?.id || ""}
          onSave={handleCollectionSave}
        />

        <AddAnnotationsToCollectionModal
          open={showAddAnnotationsModal}
          onOpenChange={setShowAddAnnotationsModal}
          unassignedAnnotations={unassignedAnnotations}
          collections={collections}
          onAddToCollection={handleAddAnnotationToCollection}
        />

        <Dialog open={showVideoUpload} onOpenChange={setShowVideoUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Video</DialogTitle>
            </DialogHeader>
            <VideoUpload onVideoAdded={handleVideoAdded} />
          </DialogContent>
        </Dialog>

        <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create Template"}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm
              template={editingTemplate || undefined}
              onSave={handleTemplateSave}
              onCancel={() => {
                setShowTemplateModal(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
