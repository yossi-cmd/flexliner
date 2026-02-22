"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

type NetflixPlayerProps = {
  src: string;
  title: string;
  onCloseHref: string;
  subtitleTracks?: { label: string; src: string; lang: string }[];
  poster?: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NetflixPlayer({
  src,
  title,
  onCloseHref,
  subtitleTracks = [],
  poster,
}: NetflixPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState(0);
  const scrubPercentRef = useRef(0);
  scrubPercentRef.current = scrubPercent;
  const didDragRef = useRef(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState<number | null>(
    subtitleTracks.length > 0 ? 0 : null
  );
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  const video = videoRef.current;

  useEffect(() => {
    if (!video || subtitleTracks.length === 0) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = activeSubtitle === i ? "showing" : "disabled";
    }
  }, [video, activeSubtitle, subtitleTracks.length]);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
      hideControlsTimerRef.current = null;
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("ended", onEnded);
    };
  }, [video]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(-0.1);
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const togglePlay = () => {
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const seek = (delta: number) => {
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
    resetHideTimer();
  };

  const getProgressPercent = useCallback((clientX: number) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return (x / rect.width) * 100;
  }, []);

  const setSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!video || !progressRef.current) return;
    const pct = getProgressPercent(e.clientX) / 100;
    video.currentTime = pct * video.duration;
    resetHideTimer();
  };

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!video || !progressRef.current || !duration) return;
      e.preventDefault();
      didDragRef.current = false;
      const pct = getProgressPercent(e.clientX);
      setIsScrubbing(true);
      setScrubPercent(pct);
      video.pause();
      video.currentTime = (pct / 100) * duration;
      resetHideTimer();
    },
    [video, duration, getProgressPercent, resetHideTimer]
  );

  useEffect(() => {
    if (!isScrubbing) return;
    const onMouseMove = (e: MouseEvent) => {
      didDragRef.current = true;
      setScrubPercent(getProgressPercent(e.clientX));
    };
    const onMouseUp = () => {
      const v = videoRef.current;
      const pct = scrubPercentRef.current;
      if (v && duration > 0) {
        v.currentTime = (pct / 100) * duration;
        v.play();
      }
      setIsScrubbing(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isScrubbing, getProgressPercent, duration]);

  useEffect(() => {
    if (!isScrubbing || !videoRef.current || !previewCanvasRef.current || duration <= 0) return;
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const drawFrame = () => {
      if (!video || !canvas || !ctx) return;
      const w = 160;
      const h = 90;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw && vh) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);
        const scale = Math.min(w / vw, h / vh);
        const sw = vw * scale;
        const sh = vh * scale;
        const x = (w - sw) / 2;
        const y = (h - sh) / 2;
        ctx.drawImage(video, 0, 0, vw, vh, x, y, sw, sh);
      }
    };
    const onSeeked = () => drawFrame();
    video.currentTime = (scrubPercent / 100) * duration;
    video.addEventListener("seeked", onSeeked);
    if (video.readyState >= 2) drawFrame();
    return () => video.removeEventListener("seeked", onSeeked);
  }, [isScrubbing, scrubPercent, duration]);

  const changeVolume = (delta: number) => {
    if (!video) return;
    const v = Math.max(0, Math.min(1, volume + delta));
    setVolume(v);
    video.volume = v;
    if (v > 0) video.muted = false;
    setIsMuted(v === 0);
    resetHideTimer();
  };

  const toggleMute = () => {
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
    resetHideTimer();
  };

  const changePlaybackRate = (rate: number) => {
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    resetHideTimer();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    resetHideTimer();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (isPlaying && hideControlsTimerRef.current) return;
        setShowVolumeSlider(false);
      }}
    >
      {/* Video */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-0 cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          playsInline
          className="max-w-full max-h-full w-full h-full object-contain netflix-player-video"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
            {subtitleTracks.map((track, i) => (
            <track
              key={track.src}
              kind="subtitles"
              src={track.src}
              srcLang={track.lang}
              label={track.label}
              default={i === 0}
            />
          ))}
        </video>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 border-4 border-flexliner-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {/* Center play/pause overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            showControls && !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors border border-white/30"
            aria-label={isPlaying ? "השהה" : "הפעל"}
          >
            <Play className="w-10 h-10 text-white mr-1" fill="currentColor" />
          </button>
        </div>
        {isPlaying && !showControls && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center"
              aria-label="השהה"
            >
              <Pause className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            href={onCloseHref}
            className="flex items-center gap-2 text-white hover:text-white/90 transition"
          >
            <X size={28} />
            <span className="hidden sm:inline font-medium">סגור</span>
          </Link>
          <p className="text-white font-medium truncate max-w-[60%] text-lg">
            {title}
          </p>
          <div className="w-20" />
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar - LTR so fill and thumb move left-to-right */}
        <div dir="ltr" className="mb-4">
          <div
            ref={progressRef}
            className="h-1 bg-white/30 rounded-full cursor-pointer group relative"
            onClick={(e) => {
              if (!didDragRef.current) setSeek(e);
            }}
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className="absolute inset-y-0 left-0 bg-flexliner-red rounded-full transition-all"
              style={{ width: `${isScrubbing ? scrubPercent : progressPercent}%` }}
            />
            {/* Preview thumbnail above thumb while scrubbing */}
            {isScrubbing && (
              <div
                className="absolute bottom-full left-0 -translate-x-1/2 mb-2 pointer-events-none z-10"
                style={{ left: `${scrubPercent}%` }}
              >
                <canvas
                  ref={previewCanvasRef}
                  width={160}
                  height={90}
                  className="block rounded border border-white/30 shadow-lg bg-black"
                />
              </div>
            )}
            <div
              className={`absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 transition-opacity shadow pointer-events-none ${
                isScrubbing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              style={{ left: `${isScrubbing ? scrubPercent : progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="p-2 text-white hover:text-white/90"
              aria-label={isPlaying ? "השהה" : "הפעל"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              onClick={() => seek(-10)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-white hover:text-white/90 font-medium tabular-nums"
              aria-label="10 שניות אחורה"
            >
              <SkipBack className="w-5 h-5 shrink-0" />
              <span>−10</span>
            </button>
            <button
              type="button"
              onClick={() => seek(10)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-white hover:text-white/90 font-medium tabular-nums"
              aria-label="10 שניות קדימה"
            >
              <SkipForward className="w-5 h-5 shrink-0" />
              <span>+10</span>
            </button>

            <div className="flex items-center gap-2 text-white/90 text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume – אזור hover מורחב למעלה; הסליידר ממוקם ביחס לכפתור בלבד */}
            <div
              className="flex items-center pt-20 -mt-20 pb-1"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 text-white hover:text-white/90"
                  aria-label={isMuted ? "בטל השתקה" : "השתק"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                {showVolumeSlider && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-3 bg-black/90 rounded flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      setIsMuted(v === 0);
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                        videoRef.current.muted = v === 0;
                      }
                    }}
                    className="w-24 h-1 accent-flexliner-red cursor-pointer"
                  />
                </div>
              )}
              </div>
            </div>

            {/* Speed */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 text-white/90 hover:text-white text-sm font-medium"
                aria-label="מהירות השמעה"
              >
                <Settings className="w-4 h-4" />
                <span>{playbackRate}x</span>
              </button>
              {showSpeedMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setShowSpeedMenu(false)}
                  />
                  <ul className="absolute bottom-full right-0 mb-2 py-2 bg-black/95 rounded min-w-[120px] z-20 shadow-xl">
                    {SPEEDS.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => changePlaybackRate(s)}
                          className={`w-full text-right px-4 py-2 text-sm hover:bg-white/10 ${
                            playbackRate === s ? "text-flexliner-red font-medium" : "text-white/90"
                          }`}
                        >
                          {s}x
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Subtitles - תמיד מוצג; לחיצה פותחת תפריט או הודעה */}
            <div className="relative">
              <button
                type="button"
                onClick={() => subtitleTracks.length > 0 && setShowSubtitleMenu((v) => !v)}
                className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium ${
                  subtitleTracks.length === 0
                    ? "text-white/40 cursor-default"
                    : activeSubtitle !== null
                      ? "text-flexliner-red"
                      : "text-white/90 hover:text-white"
                }`}
                aria-label="כתוביות"
                title={subtitleTracks.length === 0 ? "אין כתוביות זמינות לתוכן זה" : "כתוביות"}
              >
                CC
              </button>
              {showSubtitleMenu && subtitleTracks.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setShowSubtitleMenu(false)}
                  />
                  <ul className="absolute bottom-full right-0 mb-2 py-2 bg-black/95 rounded min-w-[140px] z-20 shadow-xl">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubtitle(null);
                          setShowSubtitleMenu(false);
                          if (videoRef.current) {
                            for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                              videoRef.current.textTracks[i].mode = "disabled";
                            }
                          }
                        }}
                        className={`w-full text-right px-4 py-2 text-sm hover:bg-white/10 ${
                          activeSubtitle === null ? "text-flexliner-red font-medium" : "text-white/90"
                        }`}
                      >
                        כבוי
                      </button>
                    </li>
                    {subtitleTracks.map((track, i) => (
                      <li key={track.src}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubtitle(i);
                            setShowSubtitleMenu(false);
                            if (videoRef.current && videoRef.current.textTracks[i]) {
                              for (let j = 0; j < videoRef.current.textTracks.length; j++) {
                                videoRef.current.textTracks[j].mode = j === i ? "showing" : "disabled";
                              }
                            }
                          }}
                          className={`w-full text-right px-4 py-2 text-sm hover:bg-white/10 ${
                            activeSubtitle === i ? "text-flexliner-red font-medium" : "text-white/90"
                          }`}
                        >
                          {track.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-white/90"
              aria-label={isFullscreen ? "צא ממסך מלא" : "מסך מלא"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
