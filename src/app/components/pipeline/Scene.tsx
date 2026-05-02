import { useEffect, useRef, useState } from "react";
import { FlowingPatches } from "./FlowingPatches";
import { OutputReadout } from "./OutputReadout";
import { PatchGrid } from "./PatchGrid";
import { StagePlane } from "./StagePlane";
import { TokenField } from "./TokenField";
import { TransformerVolume } from "./TransformerVolume";
import {
  CameraState,
  STAGES,
  StageId,
  localStageProgress,
  stageFromProgress,
} from "./types";

interface Props {
  progress: number;
  activeStage: StageId;
  image: string | null;
  hoveredPatch: number | null;
  selectedPatch: number | null;
  onHoverPatch: (i: number | null) => void;
  onSelectPatch: (i: number) => void;
  camera: CameraState;
  onCamera: (c: CameraState) => void;
  spacing: number;
}

export function Scene({
  progress,
  activeStage,
  image,
  hoveredPatch,
  selectedPatch,
  onHoverPatch,
  onSelectPatch,
  camera,
  onCamera,
  spacing,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredPlane, setHoveredPlane] = useState<number | null>(null);
  const drag = useRef<{ x: number; y: number; mode: "orbit" | "pan" } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.min(2, Math.max(0.5, camera.zoom - e.deltaY * 0.001));
      onCamera({ ...camera, zoom: next });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [camera, onCamera]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      mode: e.shiftKey || e.button === 1 ? "pan" : "orbit",
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    if (drag.current.mode === "orbit") {
      onCamera({
        ...camera,
        orbit: camera.orbit + dx * 0.3,
        pitch: Math.max(-40, Math.min(40, camera.pitch - dy * 0.2)),
      });
    } else {
      onCamera({ ...camera, panX: camera.panX + dx, panY: camera.panY + dy });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const stage = stageFromProgress(progress);
  const local = localStageProgress(progress, stage);
  const tokenIdx = STAGES.findIndex((x) => x.id === "token");
  const transformerIdx = STAGES.findIndex((x) => x.id === "transformer");
  const tokenMorph =
    stage.id === "token" ? local : stage.index >= tokenIdx ? 1 : 0;
  const transformerLocal =
    stage.id === "transformer" ? local : stage.index > transformerIdx ? 1 : 0;
  const effectiveHovered =
    hoveredPlane !== null
      ? hoveredPlane
      : hoveredPatch !== null
      ? stage.index
      : null;

  return (
    <div
      ref={ref}
      className="pipeline-scene"
      role="img"
      aria-label="3D pipeline scene"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        ["--cam-orbit" as string]: `${camera.orbit}deg`,
        ["--cam-pitch" as string]: `${camera.pitch}deg`,
        ["--cam-zoom" as string]: camera.zoom,
        ["--cam-pan-x" as string]: `${camera.panX}px`,
        ["--cam-pan-y" as string]: `${camera.panY}px`,
        ["--pl-stage-gap" as string]: spacing,
      }}
    >
      <div className="pipeline-scene__stage">
        <div className="pipeline-scene__rail">
          {Array.from({ length: STAGES.length - 1 }).map((_, k) => {
            const offset = k + 0.5 - (STAGES.length - 1) / 2;
            return (
              <div
                key={`int-${k}`}
                className="pipeline-interstitial"
                style={{ ["--stage-offset" as string]: offset }}
                aria-hidden
              />
            );
          })}
          {STAGES.map((s) => (
            <StagePlane
              key={s.id}
              stage={s}
              total={STAGES.length}
              active={s.id === activeStage}
              hoveredIdx={effectiveHovered}
              onHover={setHoveredPlane}
            >
              {s.id === "input" && (
                <PatchGrid
                  image={image}
                  hoveredPatch={hoveredPatch}
                  selectedPatch={selectedPatch}
                  onHover={onHoverPatch}
                  onSelect={onSelectPatch}
                  showGrid={false}
                />
              )}
              {s.id === "normalize" && (
                <div className="pipeline-channel-split" aria-label="RGB channel normalize">
                  {(["r", "g", "b"] as const).map((ch, idx) => (
                    <div
                      key={ch}
                      className="pipeline-channel-split__layer"
                      data-ch={ch}
                      style={{ ["--ch-i" as string]: idx }}
                    >
                      {image && (
                        <img src={image} alt="" aria-hidden />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {s.id === "patch" && (
                <PatchGrid
                  image={image}
                  hoveredPatch={hoveredPatch}
                  selectedPatch={selectedPatch}
                  onHover={onHoverPatch}
                  onSelect={onSelectPatch}
                />
              )}
              {s.id === "encode" && (
                <PatchGrid
                  image={image}
                  hoveredPatch={hoveredPatch}
                  selectedPatch={selectedPatch}
                  onHover={onHoverPatch}
                  onSelect={onSelectPatch}
                  showImage={false}
                />
              )}
              {s.id === "posenc" && (
                <div className="pipeline-posenc" aria-label="Positional encoding">
                  <div className="pipeline-posenc__grid">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <span
                        key={i}
                        className="pipeline-posenc__cell"
                        style={{ ["--i" as string]: i }}
                      >
                        <span className="pipeline-posenc__dot" />
                      </span>
                    ))}
                  </div>
                </div>
              )}
{s.id === "token" && (
                <TokenField
                  morph={tokenMorph}
                  hovered={hoveredPatch}
                  selected={selectedPatch}
                  onHover={onHoverPatch}
                  onSelect={onSelectPatch}
                />
              )}
              {s.id === "embedding" && (
                <TokenField
                  morph={1}
                  hovered={hoveredPatch}
                  selected={selectedPatch}
                  onHover={onHoverPatch}
                  onSelect={onSelectPatch}
                />
              )}
              {s.id === "transformer" && (
                <TransformerVolume progress={transformerLocal} />
              )}
              {s.id === "output" && <OutputReadout image={image} />}
            </StagePlane>
          ))}

          <FlowingPatches
            image={image}
            progress={progress}
            hovered={hoveredPatch}
            selected={selectedPatch}
            onHover={onHoverPatch}
            onSelect={onSelectPatch}
          />
        </div>
      </div>

      {selectedPatch !== null && (
        <div
          className="pipeline-selection-chip"
          role="status"
          aria-label="Selected patch"
        >
          <span
            className="pipeline-selection-chip__thumb"
            style={{
              backgroundImage: image ? `url(${image})` : undefined,
              backgroundSize: `${8 * 100}% ${8 * 100}%`,
              backgroundPosition: `${
                ((selectedPatch % 8) / 7) * 100
              }% ${(Math.floor(selectedPatch / 8) / 7) * 100}%`,
            }}
            aria-hidden
          />
          <span className="pipeline-selection-chip__meta">
            <span>patch #{selectedPatch}</span>
            <span>
              r{Math.floor(selectedPatch / 8)} · c{selectedPatch % 8}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onSelectPatch(-1)}
            aria-label="Clear selection"
            className="pipeline-selection-chip__clear"
          >
            ×
          </button>
        </div>
      )}

      <div
        className="pipeline-stage-hover-rail"
        aria-label="Stage hover rail"
        onMouseLeave={() => setHoveredPlane(null)}
      >
        {STAGES.map((s) => (
          <span
            key={s.id}
            className="pipeline-stage-hover-rail__item"
            data-active={effectiveHovered === s.index}
            onMouseEnter={() => setHoveredPlane(s.index)}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
