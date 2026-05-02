import { PATCH_GRID } from "./types";

interface Props {
  image: string | null;
  hoveredPatch: number | null;
  selectedPatch: number | null;
  onHover: (idx: number | null) => void;
  onSelect: (idx: number) => void;
  showImage?: boolean;
  showGrid?: boolean;
  density?: number; // 0..1, scales visible patches
}

export function PatchGrid({
  image,
  hoveredPatch,
  selectedPatch,
  onHover,
  onSelect,
  showImage = true,
  showGrid = true,
  density = 1,
}: Props) {
  const total = PATCH_GRID * PATCH_GRID;
  const visible = Math.max(1, Math.round(total * density));
  return (
    <div
      className="pipeline-patch-grid"
      style={{ ["--patch-grid" as string]: PATCH_GRID }}
      role="grid"
      aria-label="Image patch grid"
    >
      {showImage && image && (
        <img
          src={image}
          alt=""
          className="pipeline-patch-grid__image"
          aria-hidden
        />
      )}
      {showGrid && (
        <div className="pipeline-patch-grid__cells" role="presentation">
          {Array.from({ length: total }).map((_, i) => {
            const row = Math.floor(i / PATCH_GRID);
            const col = i % PATCH_GRID;
            const isHover = hoveredPatch === i;
            const isSel = selectedPatch === i;
            const inView = i < visible;
            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-label={`Patch row ${row + 1} column ${col + 1}`}
                aria-selected={isSel}
                className="pipeline-patch-grid__cell"
                data-hover={isHover}
                data-selected={isSel}
                data-inview={inView}
                onMouseEnter={() => onHover(i)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(i)}
                onBlur={() => onHover(null)}
                onClick={() => onSelect(i)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
