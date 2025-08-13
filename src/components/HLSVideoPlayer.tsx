"use client";

import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function HLSVideoPlayer({ src, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!videoRef.current || !src) return;

    const video = videoRef.current;
    console.log("HLS Player: Loading source:", src);
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    if (Hls.isSupported()) {
      console.log("HLS Player: HLS.js is supported");
      const hls = new Hls({
        debug: true,
        enableWorker: false,
        xhrSetup: function(xhr, url) {
          console.log("HLS Player: Setting up XHR for:", url);
          // Try to handle CORS
          xhr.withCredentials = false;
        }
      });
      hlsRef.current = hls;
      
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS Player: Manifest parsed successfully");
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch((error) => {
            console.error("HLS Player: Autoplay failed:", error);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Player: Error occurred:", data);
        setIsLoading(false);
        
        let errorMsg = "An error occurred while loading the video";
        
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            errorMsg = "Failed to load video manifest. This might be a CORS issue.";
            console.error("HLS Player: Manifest load error - likely CORS issue");
          } else if (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
            errorMsg = "Failed to load video fragment. Check network connectivity.";
          } else {
            errorMsg = "Network error occurred while loading video";
          }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          errorMsg = "Media decoding error occurred";
        }
        
        setErrorMessage(errorMsg);
        
        if (data.fatal) {
          setHasError(true);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("HLS Player: Fatal network error encountered, trying to recover");
              // Don't automatically retry on CORS errors
              if (data.details !== Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("HLS Player: Fatal media error encountered, trying to recover");
              hls.recoverMediaError();
              break;
            default:
              console.log("HLS Player: Fatal error, destroying HLS instance");
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        console.log("HLS Player: Fragment loaded");
        setHasError(false);
      });

    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS support
      console.log("HLS Player: Using Safari native HLS support");
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        console.log("HLS Player: Metadata loaded (Safari)");
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch((error) => {
            console.error("HLS Player: Autoplay failed (Safari):", error);
          });
        }
      });
      video.addEventListener("error", (e) => {
        console.error("HLS Player: Video error (Safari):", e);
        setIsLoading(false);
        setHasError(true);
        setErrorMessage("Failed to load video. This might be a CORS issue or unsupported format.");
      });
    } else {
      console.error("HLS Player: HLS is not supported in this browser");
      setIsLoading(false);
      setHasError(true);
      setErrorMessage("HLS playback is not supported in this browser");
    }

    return () => {
      if (hlsRef.current) {
        console.log("HLS Player: Cleaning up HLS instance");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updatePlayState = () => setIsPlaying(!video.paused);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", updatePlayState);
    video.addEventListener("pause", updatePlayState);

    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === video);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", updatePlayState);
      video.removeEventListener("pause", updatePlayState);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (isFullscreen) {
      document.exitFullscreen().catch(console.error);
    } else {
      videoRef.current.requestFullscreen().catch(console.error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = newTime;
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-auto max-h-96"
        playsInline
        controls={false}
      />
      
      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Time Display */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.784L4.5 13H3a1 1 0 01-1-1V8a1 1 0 011-1h1.5l3.883-3.784zm-2.085 7.924L5 13V7l2.298 2zm7.542 2.707a1 1 0 01-1.414-1.414L14.586 11l-1.16-1.293a1 1 0 111.414-1.414L16 9.414l1.16-1.121a1 1 0 111.414 1.414L17.414 11l1.16 1.293a1 1 0 01-1.414 1.414L16 12.586l-1.16 1.121z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.784L4.5 13H3a1 1 0 01-1-1V8a1 1 0 011-1h1.5l3.883-3.784zm5.208 6.924a3 3 0 010 0zm1.414-1.414a5 5 0 010 7.07l-.707-.707a4 4 0 000-5.656l.707-.707zm-2.121.707a1 1 0 010 1.414 2 2 0 000 2.828l-.707.707a3 3 0 010-4.242l.707-.707z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading/Error State */}
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <p className="text-white">Select a channel to start streaming</p>
        </div>
      )}

      {/* Loading State */}
      {src && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {src && hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center max-w-md px-4">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.824-.833-2.598 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-white mb-2">Failed to load stream</p>
            <p className="text-gray-400 text-sm mb-3">{errorMessage || "Check console for details"}</p>
            {errorMessage.includes("CORS") && (
              <div className="text-yellow-400 text-xs">
                <p>💡 CORS Fix Suggestions:</p>
                <ul className="text-left mt-1 space-y-1">
                  <li>• Configure server to send proper CORS headers</li>
                  <li>• Serve the video from the same domain</li>
                  <li>• Contact backend team to add your domain to allowed origins</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
