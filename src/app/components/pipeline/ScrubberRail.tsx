import { useRef } from "react";

interface Props {
  progress: number;
  onProgress: (p: number) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onReset: () => void;
  onUpload: (file: File) => void;
  spacing: number;
  onSpacing: (s: number) => void;
}

export function ScrubberRail({
  progress,
  onProgress,
  onPrev,
  onNext,
  canPrev,
  canNext,
  onReset,
  onUpload,
  spacing,
  onSpacing,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="pipeline-scrubber-rail" aria-label="Pipeline controls">
      <button
        type="button"
        className="pipeline-btn"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous stage"
      >
        Prev
      </button>
      <button
        type="button"
        className="pipeline-btn"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next stage"
      >
        Next
      </button>
      <div className="pipeline-scrubber pipeline-scrubber--steps">
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={(e) => onProgress(Number(e.target.value) / 1000)}
          aria-label="Pipeline progress"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={progress}
          className="pipeline-scrubber__input"
        />
      </div>
      <button
        type="button"
        className="pipeline-btn"
        onClick={() => fileRef.current?.click()}
        aria-label="Upload image"
      >
        Upload
      </button>
      <button
        type="button"
        className="pipeline-btn"
        onClick={onReset}
        aria-label="Reset view"
      >
        Reset
      </button>
      <div className="pipeline-scrubber pipeline-scrubber--spacing">
        <input
          type="range"
          min={20}
          max={180}
          value={Math.round(spacing * 100)}
          onChange={(e) => onSpacing(Number(e.target.value) / 100)}
          aria-label="Stack spacing"
          aria-valuemin={0.2}
          aria-valuemax={1.8}
          aria-valuenow={spacing}
          className="pipeline-scrubber__input"
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
