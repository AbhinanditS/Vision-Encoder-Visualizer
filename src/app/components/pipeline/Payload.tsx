import { StageId } from "./types";

interface Props {
  // Continuous index along the rail of stage planes (0..STAGES-1)
  position: number;
  phase: StageId;
}

export function Payload({ position, phase }: Props) {
  return (
    null
  );
}
