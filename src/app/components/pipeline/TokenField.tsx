import { PATCH_GRID, TOKEN_COUNT } from "./types";

interface Props {
  // 0 = spatial grid, 1 = stream
  morph: number;
  hovered: number | null;
  selected: number | null;
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
}

export function TokenField({ morph, hovered, selected, onHover, onSelect }: Props) {
  return (
    <div
      className="pipeline-token-field"
      style={{
        ["--morph" as string]: morph,
        ["--patch-grid" as string]: PATCH_GRID,
      }}
      role="list"
      aria-label="Token field"
    >
      {Array.from({ length: TOKEN_COUNT }).map((_, i) => {
        const row = Math.floor(i / PATCH_GRID);
        const col = i % PATCH_GRID;
        const streamX = (i / (TOKEN_COUNT - 1)) * 100;
        const gridX = (col / (PATCH_GRID - 1)) * 100;
        const gridY = (row / (PATCH_GRID - 1)) * 100;
        return (
          <button
            type="button"
            key={i}
            role="listitem"
            aria-label={`Token ${i + 1}`}
            aria-selected={selected === i}
            className="pipeline-token"
            data-hover={hovered === i}
            data-selected={selected === i}
            style={{
              ["--grid-x" as string]: `${gridX}%`,
              ["--grid-y" as string]: `${gridY}%`,
              ["--stream-x" as string]: `${streamX}%`,
              ["--token-i" as string]: i,
            }}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(i)}
          />
        );
      })}
    </div>
  );
}
