import {
  PATCH_GRID,
  STAGES,
  TOKEN_COUNT,
  localStageProgress,
  stageFromProgress,
} from "./types";

interface Props {
  image: string | null;
  progress: number;
  hovered: number | null;
  selected: number | null;
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function FlowingPatches({
  image,
  progress,
  hovered,
  selected,
  onHover,
  onSelect,
}: Props) {
  const stage = stageFromProgress(progress);
  const local = localStageProgress(progress, stage);

  const railIndex = progress * (STAGES.length - 1);
  const railOffset = railIndex - (STAGES.length - 1) / 2;

  let morph = 0;
  let flowScale = 1;
  let imgOpacity = 1;
  let shimmer = false;
  let waveAmp = 0;
  let gapMul = 1;
  let tokenize = 0;
  let channelSplit = 0;
  let pool = 0;

  switch (stage.id) {
    case "input":
      break;
    case "normalize":
      channelSplit = local;
      shimmer = true;
      gapMul = lerp(1, 1.04, local);
      break;
    case "patch":
      gapMul = lerp(1.04, 1.12, local);
      break;
    case "encode":
      gapMul = 1.12;
      shimmer = true;
      imgOpacity = lerp(1, 0.8, local);
      tokenize = lerp(0, 0.25, local);
      break;
    case "posenc":
      gapMul = 1.12;
      shimmer = true;
      imgOpacity = lerp(0.8, 0.7, local);
      tokenize = lerp(0.25, 0.4, local);
      break;
    case "token":
      morph = local;
      gapMul = 1.12;
      flowScale = lerp(1, 0.32, local);
      imgOpacity = lerp(0.7, 0.5, local);
      tokenize = lerp(0.4, 0.6, local);
      shimmer = true;
      break;
    case "embedding":
      morph = 1;
      flowScale = lerp(0.32, 0.22, local);
      imgOpacity = lerp(0.5, 0.3, local);
      tokenize = lerp(0.6, 0.85, local);
      shimmer = true;
      break;
    case "transformer":
      morph = 1;
      flowScale = 0.22;
      imgOpacity = lerp(0.3, 0.15, local);
      tokenize = lerp(0.85, 0.97, local);
      shimmer = true;
      waveAmp = lerp(0, 80, Math.min(1, local * 1.4));
      break;
    case "output":
      morph = 1 - local;
      flowScale = lerp(0.22, 1, local);
      imgOpacity = lerp(0.15, 1, local);
      tokenize = lerp(0.97, 0, local);
      break;
  }

  return (
    <div
      className="pipeline-flow"
      data-shimmer={shimmer}
      data-stage={stage.id}
      style={{
        ["--flow-rail-offset" as string]: railOffset,
        ["--morph" as string]: morph,
        ["--flow-scale" as string]: flowScale,
        ["--img-opacity" as string]: imgOpacity,
        ["--tokenize" as string]: tokenize,
        ["--gap-mul" as string]: gapMul,
        ["--wave-amp" as string]: `${waveAmp}px`,
        ["--channel-split" as string]: channelSplit,
        ["--pool" as string]: pool,
      }}
    >
      {Array.from({ length: TOKEN_COUNT }).map((_, i) => {
        const row = Math.floor(i / PATCH_GRID);
        const col = i % PATCH_GRID;

        const gx = (col - (PATCH_GRID - 1) / 2) * (320 / PATCH_GRID);
        const gy = (row - (PATCH_GRID - 1) / 2) * (360 / PATCH_GRID);
        const sx = (i - (TOKEN_COUNT - 1) / 2) * ((320 * 0.92) / TOKEN_COUNT);

        const wavePhase = (i / TOKEN_COUNT) * Math.PI * 4;

        const isSelected = selected === i;
        const isHovered = hovered === i;

        return (
          <button
            type="button"
            key={i}
            className="pipeline-flow__patch"
            data-hover={isHovered}
            data-selected={isSelected}
            aria-label={`Patch ${i + 1}`}
            aria-pressed={isSelected}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(i)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(i)}
            style={{
              ["--gx" as string]: `${gx}px`,
              ["--gy" as string]: `${gy}px`,
              ["--sx" as string]: `${sx}px`,
              ["--i" as string]: i,
              ["--wave-phase" as string]: wavePhase,
              backgroundImage: image ? `url(${image})` : undefined,
              backgroundSize: `${PATCH_GRID * 100}% ${PATCH_GRID * 100}%`,
              backgroundPosition: `${(col / (PATCH_GRID - 1)) * 100}% ${
                (row / (PATCH_GRID - 1)) * 100
              }%`,
            }}
          />
        );
      })}
    </div>
  );
}
