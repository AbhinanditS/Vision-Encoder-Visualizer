import { ChevronLeft, ChevronRight, RotateCcw, Upload } from "lucide-react";
import { useRef } from "react";

interface Props {
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onUpload: (file: File) => void;
  canPrev: boolean;
  canNext: boolean;
  spacing: number;
  onSpacing: (s: number) => void;
}

export function ControlRail({
  onPrev,
  onNext,
  onReset,
  onUpload,
  canPrev,
  canNext,
  spacing,
  onSpacing,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="pipeline-control-rail"
      role="toolbar"
      aria-label="Pipeline controls"
    >
      <button
        type="button"
        className="pipeline-btn"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous stage"
      >
        <ChevronLeft size={14} aria-hidden /> <span>Prev</span>
      </button>
      <button
        type="button"
        className="pipeline-btn"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next stage"
      >
        <span>Next</span> <ChevronRight size={14} aria-hidden />
      </button>
      <label className="pipeline-spacing" aria-label="Stack spacing">
        <span>spacing</span>
        <input
          type="range"
          min={20}
          max={180}
          value={Math.round(spacing * 100)}
          onChange={(e) => onSpacing(Number(e.target.value) / 100)}
          aria-valuemin={0.2}
          aria-valuemax={1.8}
          aria-valuenow={spacing}
        />
        <span className="pipeline-spacing__val">{spacing.toFixed(2)}</span>
      </label>
      <button
        type="button"
        className="pipeline-btn"
        onClick={onReset}
        aria-label="Reset pipeline"
      >
        <RotateCcw size={12} aria-hidden /> <span>Reset</span>
      </button>
      <button
        type="button"
        className="pipeline-btn pipeline-btn--accent"
        onClick={() => fileRef.current?.click()}
        aria-label="Upload image"
      >
        <Upload size={12} aria-hidden /> <span>Upload</span>
      </button>
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
