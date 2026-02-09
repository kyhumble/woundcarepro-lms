import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, CheckCircle2, PictureInPicture, SkipBack, SkipForward
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VideoPlayer({ src, onComplete, isCompleted }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [hasWatchedMost, setHasWatchedMost] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Mark as watched if 80% complete
      if (video.currentTime / video.duration >= 0.8 && !hasWatchedMost) {
        setHasWatchedMost(true);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setHasWatchedMost(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [hasWatchedMost]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume || 0.5;
      setVolume(volume || 0.5);
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", () => {
      setIsFullscreen(!!document.fullscreenElement);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-black group aspect-video"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onClick={togglePlay}
      >
        <track kind="captions" />
      </video>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110"
          >
            <Play className="w-10 h-10 text-slate-900 ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Seek Bar */}
        <div className="px-4 pb-2">
          <div className="relative group/seek">
            <div className="h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
              <div className="h-full bg-white/40" style={{ width: `${buffered}%` }} />
              <div className="h-full bg-teal-500 absolute top-0 left-0" style={{ width: `${(currentTime / duration) * 100}%` }} />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-teal-500 rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-teal-400 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button onClick={() => skip(-10)} className="text-white hover:text-teal-400 transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>

            <button onClick={() => skip(10)} className="text-white hover:text-teal-400 transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-teal-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white hover:text-teal-400 transition-colors flex items-center gap-1">
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">{playbackRate}x</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <DropdownMenuItem key={rate} onClick={() => changePlaybackRate(rate)}>
                    {rate}x {rate === playbackRate && "✓"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Picture in Picture */}
            <button onClick={togglePictureInPicture} className="text-white hover:text-teal-400 transition-colors">
              <PictureInPicture className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-teal-400 transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mark Complete Button */}
      {hasWatchedMost && !isCompleted && onComplete && (
        <div className="absolute top-4 right-4">
          <Button
            onClick={onComplete}
            className="bg-teal-600 hover:bg-teal-700 gap-2 shadow-lg"
            size="sm"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark Lesson Complete
          </Button>
        </div>
      )}
    </div>
  );
}