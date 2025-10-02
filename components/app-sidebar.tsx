"use client"

import * as React from "react"
import type { Video, Annotation, Template, Collection } from "@/lib/types"
import { formatTime } from "@/lib/utils/video"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  ChevronRight,
  FileVideo,
  Tag,
  LayoutTemplate,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Download,
  Upload,
  FolderOpen,
} from "lucide-react"

import { Input } from "./ui/input"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  videos: Video[]
  annotations: Annotation[]
  collections: Collection[]
  templates: Template[]
  currentVideo?: Video | null
  selectedCollection?: Collection | null
  onVideoSelect?: (video: Video) => void
  onAnnotationClick?: (annotation: Annotation) => void
  onEditAnnotation?: (annotation: Annotation) => void
  onDeleteAnnotation?: (annotationId: string) => void
  onSelectCollection?: (collection: Collection) => void
  onEditCollection?: (collection: Collection) => void
  onDeleteCollection?: (collectionId: string) => void
  onCreateCollection?: () => void
  onDeleteVideo?: (videoId: string) => void
  onEditVideo?: (video: Video) => void
  onEditTemplate?: (template: Template) => void
  onDeleteTemplate?: (templateId: string) => void
  onCreateVideo?: () => void
  onCreateTemplate?: () => void
  // filter enabling
  filter: string
  onFilterChange: (filter: string) => void
  // import/export
  onExportData?: (format: "json" | "csv") => void
  onImportData?: () => void
}

export function AppSidebar({
  videos,
  annotations,
  collections,
  templates,
  filter,
  onFilterChange,
  currentVideo,
  selectedCollection,
  onVideoSelect,
  onDeleteVideo,
  onEditVideo,
  onAnnotationClick,
  onEditAnnotation,
  onDeleteAnnotation,
  onSelectCollection,
  onEditCollection,
  onDeleteCollection,
  onCreateCollection,
  onEditTemplate,
  onDeleteTemplate,
  onCreateVideo,
  onCreateTemplate,
  onExportData,
  onImportData,
  ...props
}: AppSidebarProps) {
  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this video and all its annotations?")) return

    try {
      onDeleteVideo?.(videoId)
    } catch (error) {
      console.error("Error deleting video:", error)
    }
  }

  const unassignedAnnotations = React.useMemo(() => {
    return [...annotations].filter((a) => !a.collectionId).sort((a, b) => a.startTime - b.startTime)
  }, [annotations])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileVideo className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">VanNote</span>
            <span className="text-xs text-muted-foreground">Video Annotator</span>
          </div>
        </div>
        <div className="px-2 pb-2 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onImportData?.()}>
            <Upload className="h-3 w-3 mr-1" />
            Import
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExportData?.("json")}>Export as JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportData?.("csv")}>Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="p-2">
          <Input placeholder="Filter..." value={filter} onChange={(e) => onFilterChange(e.target.value)} />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Videos Section */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                <FileVideo className="h-4 w-4 mr-2" />
                Videos ({videos.length})
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {videos.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">
                      No videos yet. Upload one to start annotating.
                    </div>
                  ) : (
                    videos.map((video) => (
                      <SidebarMenuItem key={video.id}>
                        <SidebarMenuButton asChild isActive={currentVideo?.id === video.id} className="group">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onVideoSelect?.(video)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{video.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(video.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => onEditVideo?.(video)}>
                                  <Edit className="h-4 w-4 mr-2" /> Edit Video
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => handleDeleteVideo(video.id, e)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete Video
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}

                  {onCreateVideo && (
                    <SidebarMenuItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={onCreateVideo}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Upload Video
                      </Button>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {currentVideo && (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Collections ({collections.length})
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {collections.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted-foreground">
                        No collections yet. Create one to organize annotations.
                      </div>
                    ) : (
                      collections.map((collection) => (
                        <SidebarMenuItem key={collection.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={selectedCollection?.id === collection.id}
                            className="group"
                          >
                            <div
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => onSelectCollection?.(collection)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{collection.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {collection.annotationIds.length} annotations
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEditCollection?.(collection)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm("Delete this collection? Annotations will be unassigned.")) {
                                      onDeleteCollection?.(collection.id)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}

                    {onCreateCollection && (
                      <SidebarMenuItem>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={onCreateCollection}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          New Collection
                        </Button>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {currentVideo && (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  <Tag className="h-4 w-4 mr-2" />
                  Unassigned ({unassignedAnnotations.length})
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {unassignedAnnotations.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted-foreground">All annotations are in collections.</div>
                    ) : (
                      unassignedAnnotations.map((annotation) => (
                        <SidebarMenuItem key={annotation.id}>
                          <SidebarMenuButton asChild className="group">
                            <div
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => onAnnotationClick?.(annotation)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{annotation.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  {formatTime(annotation.startTime)}
                                  {annotation.endTime && (
                                    <>
                                      <span>→</span>
                                      {formatTime(annotation.endTime)}
                                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                        Segment
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEditAnnotation?.(annotation)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteAnnotation?.(annotation.id)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Templates Section */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Templates ({templates.length})
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {templates.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">
                      No templates yet. Create one to structure your collections.
                    </div>
                  ) : (
                    templates.map((template) => (
                      <SidebarMenuItem key={template.id}>
                        <SidebarMenuButton asChild className="group">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{template.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {template.keys.length} fields
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditTemplate?.(template)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm("Delete this template?")) {
                                    onDeleteTemplate?.(template.id)
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}

                  {onCreateTemplate && (
                    <SidebarMenuItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={onCreateTemplate}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        New Template
                      </Button>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
