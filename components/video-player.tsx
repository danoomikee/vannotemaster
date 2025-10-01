// src/components/video-player.tsx

"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import YouTube from "react-youtube";
import type { YouTubePlayer } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { formatTime } from "@/lib/utils/video";
import type { Annotation } from "@/lib/types";

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  isPaused: () => boolean;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  src?: string;
  youtubeId?: string;
  annotations?: Annotation[];
  onTimeUpdate?: (currentTime: number) => void;
  onAnnotationClick?: (annotation: Annotation) => void;
  className?: string;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      src,
      youtubeId,
      annotations = [],
      onTimeUpdate,
      onAnnotationClick,
      className = "",
    },
    ref
  ) => {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const ytPlayerRef = useRef<YouTubePlayer | null>(null);
    const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Reset state when video source changes
    useEffect(() => {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsReady(false);
      ytPlayerRef.current = null;
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    }, [src, youtubeId]);

    // Imperative handle for parent component to control player
    useImperativeHandle(ref, () => ({
      play: () => {
        if (youtubeId && ytPlayerRef.current) {
          ytPlayerRef.current.playVideo();
        } else if (internalVideoRef.current) {
          internalVideoRef.current.play();
        }
      },
      pause: () => {
        if (youtubeId && ytPlayerRef.current) {
          ytPlayerRef.current.pauseVideo();
        } else if (internalVideoRef.current) {
          internalVideoRef.current.pause();
        }
      },
      seek: (time: number) => {
        if (youtubeId && ytPlayerRef.current) {
          ytPlayerRef.current.seekTo(time, true);
          setCurrentTime(time);
        } else if (internalVideoRef.current) {
          internalVideoRef.current.currentTime = time;
        }
      },
      isPaused: () => {
        if (youtubeId && ytPlayerRef.current) {
          // States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
          const state = ytPlayerRef.current.getPlayerState();
          return state !== 1;
        }
        return internalVideoRef.current?.paused ?? true;
      },
      getCurrentTime: () => {
        if (youtubeId && ytPlayerRef.current) {
          return ytPlayerRef.current.getCurrentTime() || 0;
        }
        return internalVideoRef.current?.currentTime || 0;
      },
    }));

    // Effect for HTML5 video events
    useEffect(() => {
      const video = internalVideoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        const time = video.currentTime;
        setCurrentTime(time);
        onTimeUpdate?.(time);
      };
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsReady(true);
      };
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }, [onTimeUpdate]);

    // YouTube Player event handlers
    const onPlayerReady = (event: { target: YouTubePlayer }) => {
      ytPlayerRef.current = event.target;
      setDuration(event.target.getDuration());
      setIsReady(true);
    };

    const onPlayerStateChange = (event: { data: number }) => {
      const state = event.data;
      if (state === YouTube.PlayerState.PLAYING) {
        setIsPlaying(true);
        timeIntervalRef.current = setInterval(() => {
          const time = ytPlayerRef.current?.getCurrentTime() ?? 0;
          setCurrentTime(time);
          onTimeUpdate?.(time);
        }, 250);
      } else {
        setIsPlaying(false);
        if (timeIntervalRef.current) {
          clearInterval(timeIntervalRef.current);
        }
      }
    };

    const hasVideo = !!(src || youtubeId);

    const getPlayerHandle = (): VideoPlayerHandle | null => {
      // If ref is a RefObject, return its current
      if (ref && typeof ref !== "function" && "current" in ref) {
        return ref.current;
      }
      // If ref is a callback ref, we can't access the instance
      return null;
    };

    const togglePlay = () => {
      if (!hasVideo || !isReady) return;
      const player = getPlayerHandle();
      if (player?.isPaused) {
        player?.play();
      } else {
        player?.pause();
      }
    };

    const handleSeek = (value: number[]) => {
      if (!hasVideo || !isReady) return;
      const player = getPlayerHandle();
      player?.seek(value[0]);
    };

    const handleVolumeChange = (value: number[]) => {
      const newVolume = value[0];
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      if (youtubeId && ytPlayerRef.current) {
        ytPlayerRef.current.setVolume(newVolume * 100);
      } else if (internalVideoRef.current) {
        internalVideoRef.current.volume = newVolume;
      }
    };

    const toggleMute = () => {
      if (!hasVideo || !isReady) return;
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if (youtubeId && ytPlayerRef.current) {
        if (newMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      } else if (internalVideoRef.current) {
        internalVideoRef.current.muted = newMuted;
      }
    };

    const skipTime = (seconds: number) => {
      if (!hasVideo || !isReady) return;
      const player = getPlayerHandle();
      const currentTime = player?.getCurrentTime() ?? 0;
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      player?.seek(newTime);
    };

    const toggleFullscreen = () => {
      if (!containerRef.current || !hasVideo) return;
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    // const seekToTime = (time: number) => {
    //   if (!hasVideo || !isReady) return;
    //   const player = getPlayerHandle();
    //   player?.seek(time);
    // };

    return (
      <div
        ref={containerRef}
        className={`video-container max-h-full overflow-hidden ${className}`}
      >
        <div className="relative w-full h-full flex flex-col max-h-full">
          {youtubeId ? (
            <YouTube
              videoId={youtubeId}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              className="flex-1 w-full max-h-full bg-black"
              iframeClassName="w-full h-full"
              opts={{
                playerVars: {
                  controls: 0,
                  disablekb: 1,
                  modestbranding: 1,
                  rel: 0,
                  origin:
                    typeof window !== "undefined" ? window.location.origin : "",
                },
              }}
            />
          ) : (
            <video
              ref={internalVideoRef}
              src={src}
              className="flex-1 w-full max-h-full bg-black object-contain"
              onClick={togglePlay}
            />
          )}

          <div className="absolute bottom-16 left-0 right-0 h-2 pointer-events-none">
            {annotations.map((annotation) => {
              const leftPercent =
                duration > 0 ? (annotation.startTime / duration) * 100 : 0;
              const widthPercent =
                annotation.endTime && duration > 0
                  ? ((annotation.endTime - annotation.startTime) / duration) *
                    100
                  : 0;

              return (
                <div key={annotation.id}>
                  {!annotation.endTime && (
                    <div
                      className="annotation-marker pointer-events-auto"
                      style={{ left: `${leftPercent}%` }}
                      onClick={() => onAnnotationClick?.(annotation)}
                      title={annotation.title}
                    />
                  )}
                  {annotation.endTime && (
                    <div
                      className="segment-marker pointer-events-auto"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      onClick={() => onAnnotationClick?.(annotation)}
                      title={`${annotation.title} (${formatTime(
                        annotation.startTime
                      )} - ${formatTime(annotation.endTime)})`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={!hasVideo || !isReady}
              />
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(-5)}
                  className="text-white hover:bg-white/20"
                  disabled={!hasVideo || !isReady}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                  disabled={!hasVideo || !isReady}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(5)}
                  className="text-white hover:bg-white/20"
                  disabled={!hasVideo || !isReady}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                    disabled={!hasVideo || !isReady}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                    disabled={!hasVideo || !isReady}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                  disabled={!hasVideo || !isReady}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
