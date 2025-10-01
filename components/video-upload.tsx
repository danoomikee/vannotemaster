"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, Video } from "lucide-react"
import { extractYouTubeVideoId, generateVideoHash } from "@/lib/utils/video"
import { storage } from "@/lib/storage"

interface VideoUploadProps {
  onVideoAdded: (videoId: string) => void
}

export function VideoUpload({ onVideoAdded }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoTitle, setVideoTitle] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Generate hash for the file
      const hash = await generateVideoHash(file)

      // Create object URL for local playback
      const url = URL.createObjectURL(file)

      // Create video record
      const video = await storage.createVideo({
        title: videoTitle || file.name,
        hash,
        url,
      })

      onVideoAdded(video.id)
      setVideoTitle("")
    } catch (error) {
      console.error("Error uploading video:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    setIsUploading(true)
    try {
      const videoId = extractYouTubeVideoId(youtubeUrl)
      if (!videoId) {
        throw new Error("Invalid YouTube URL")
      }

      // Create video record
      const video = await storage.createVideo({
        title: videoTitle || `YouTube Video (${videoId})`,
        videoId,
        url: youtubeUrl,
      })

      onVideoAdded(video.id)
      setYoutubeUrl("")
      setVideoTitle("")
    } catch (error) {
      console.error("Error adding YouTube video:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Add Video for Annotation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="youtube" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              YouTube URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="youtube" className="space-y-4">
            <form onSubmit={handleYouTubeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube-title">Video Title (Optional)</Label>
                <Input
                  id="youtube-title"
                  type="text"
                  placeholder="Enter a custom title..."
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={isUploading || !youtubeUrl.trim()} className="w-full">
                {isUploading ? "Adding Video..." : "Add YouTube Video"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-title">Video Title (Optional)</Label>
                <Input
                  id="video-title"
                  type="text"
                  placeholder="Enter a custom title..."
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-file">Video File</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>

              {isUploading && <div className="text-center text-sm text-muted-foreground">Processing video file...</div>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
