import { ReactNode } from "react";
import { StageDef } from "./types";

interface Props {
  stage: StageDef;
  active: boolean;
  total: number;
  hoveredIdx: number | null;
  onHover: (i: number | null) => void;
  children?: ReactNode;
}

export function StagePlane({
  stage,
  active,
  total,
  hoveredIdx,
  onHover,
  children,
}: Props) {
  const offset = stage.index - (total - 1) / 2;
  const dist = hoveredIdx === null ? 99 : Math.abs(hoveredIdx - stage.index);
  const isHovered = hoveredIdx === stage.index;
  return (
    <div
      className="pipeline-stage-plane"
      data-stage={stage.id}
      data-active={active}
      data-hovered={isHovered}
      style={{
        ["--stage-offset" as string]: offset,
        ["--hover-dist" as string]: dist,
      }}
      onMouseEnter={() => onHover(stage.index)}
      onMouseLeave={() => onHover(null)}
      aria-label={`Stage ${stage.label}`}
    >
      <div className="pipeline-stage-plane__frame">
        <div className="pipeline-stage-plane__inner">{children}</div>
      </div>
      <div className="pipeline-stage-plane__caption">
        <span className="pipeline-stage-plane__index">
          {String(stage.index + 1).padStart(2, "0")}
        </span>
        <span className="pipeline-stage-plane__label">{stage.label}</span>
      </div>
    </div>
  );
}
