export type StageId =
  | "input"
  | "normalize"
  | "patch"
  | "encode"
  | "posenc"
  | "token"
  | "embedding"
  | "transformer"
  | "output";

export interface StageDef {
  id: StageId;
  label: string;
  index: number;
  start: number;
  end: number;
}

const RAW: { id: StageId; label: string }[] = [
  { id: "input", label: "Pixels" },
  { id: "normalize", label: "Normalize" },
  { id: "patch", label: "Patchify" },
  { id: "encode", label: "Project" },
  { id: "posenc", label: "Position" },
  { id: "token", label: "Tokens" },
  { id: "embedding", label: "Embed" },
  { id: "transformer", label: "Transformer" },
  { id: "output", label: "Output" },
];

const STEP = 1 / RAW.length;
export const STAGES: StageDef[] = RAW.map((s, i) => ({
  ...s,
  index: i,
  start: i * STEP,
  end: (i + 1) * STEP,
}));

export const PATCH_GRID = 8; // 8x8 = 64 patches
export const TOKEN_COUNT = PATCH_GRID * PATCH_GRID;

export interface CameraState {
  orbit: number; // yaw degrees
  pitch: number; // pitch degrees
  zoom: number; // 0.5 - 2
  panX: number;
  panY: number;
}

export interface PipelineState {
  progress: number;
  activeStage: StageId;
  hoveredPatch: number | null;
  selectedPatch: number | null;
  uploadedImage: string | null;
  camera: CameraState;
}

export function stageFromProgress(p: number): StageDef {
  return (
    STAGES.find((s) => p >= s.start && p < s.end) ?? STAGES[STAGES.length - 1]
  );
}

export function localStageProgress(p: number, stage: StageDef): number {
  return Math.min(1, Math.max(0, (p - stage.start) / (stage.end - stage.start)));
}
