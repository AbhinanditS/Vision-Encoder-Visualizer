import { STAGE_COPY } from "./stageInfo";
import { STAGES, StageId, localStageProgress, stageFromProgress } from "./types";

interface Props {
  progress: number;
  activeStage: StageId;
}

export function StageInfoPanel({ progress, activeStage }: Props) {
  const stage = stageFromProgress(progress);
  const copy = STAGE_COPY[activeStage];
  const local = localStageProgress(progress, stage);
  const idx = STAGES.findIndex((s) => s.id === activeStage);

  return (
    <aside
      className="pipeline-info-panel"
      aria-label={`Stage explanation: ${copy.title}`}
    >
      <header className="pipeline-info-panel__head">
        <span className="pipeline-info-panel__step">
          STEP {String(idx + 1).padStart(2, "0")} / {STAGES.length}
        </span>
        <span className="pipeline-info-panel__op">{copy.op}</span>
      </header>

      <h2 className="pipeline-info-panel__title">{copy.title}</h2>

      <p className="pipeline-info-panel__plain">{copy.plain}</p>

      <dl className="pipeline-info-panel__shape" aria-label="Tensor shape">
        <div>
          <dt>in</dt>
          <dd>{copy.shapeIn}</dd>
        </div>
        <div>
          <dt>out</dt>
          <dd>{copy.shapeOut}</dd>
        </div>
      </dl>

      <p className="pipeline-info-panel__tech" aria-label="Technical detail">
        {copy.technical}
      </p>

      <div
        className="pipeline-info-panel__progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={local}
        aria-label="Stage local progress"
      >
        <span style={{ width: `${local * 100}%` }} />
      </div>
    </aside>
  );
}
