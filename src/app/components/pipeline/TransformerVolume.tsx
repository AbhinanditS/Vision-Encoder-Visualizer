interface Props {
  progress: number; // 0..1 within transformer stage
  decks?: number;
  grid?: number;
}

const MEMBRANE_DEPTH = 20; // px between consecutive membranes

export function TransformerVolume({
  progress,
  decks = 10,
  grid = 8,
}: Props) {
  const wave = progress * (decks - 1);
  const currentLayer = Math.floor(wave);
  const totalNodes = grid * grid;

  // Stable in-plane attention segments per membrane (a few per layer).
  const attnPerLayer = 4;
  const attnSegments = (li: number) =>
    Array.from({ length: attnPerLayer }).map((_, k) => {
      const a = (li * 31 + k * 17) % totalNodes;
      const b = (li * 53 + k * 29 + 7) % totalNodes;
      return { a, b };
    });

  return (
    <div
      className="pipeline-nn-stack"
      style={{
        ["--decks" as string]: decks,
        ["--mgrid" as string]: grid,
        ["--mdepth" as string]: `${MEMBRANE_DEPTH}px`,
      }}
      aria-label={`Stacked neural network — ${decks} layers of ${grid}×${grid} nodes`}
    >
      {Array.from({ length: decks }).map((_, li) => {
        const offsetZ = (li - (decks - 1) / 2) * MEMBRANE_DEPTH;
        const dist = Math.abs(li - wave);
        const passed = li < wave;
        const current = li === currentLayer;
        return (
          <div
            key={`m-${li}`}
            className="pipeline-nn-membrane"
            data-current={current}
            data-passed={passed}
            style={{
              ["--li" as string]: li,
              ["--dist" as string]: dist,
              transform: `translateZ(${offsetZ}px)`,
            }}
          >
            <div className="pipeline-nn-membrane__frame" aria-hidden />

            {/* nodes */}
            {Array.from({ length: totalNodes }).map((_, ni) => {
              const r = Math.floor(ni / grid);
              const c = ni % grid;
              return (
                <span
                  key={`n-${li}-${ni}`}
                  className="pipeline-nn-node"
                  style={{
                    left: `${((c + 0.5) / grid) * 100}%`,
                    top: `${((r + 0.5) / grid) * 100}%`,
                    ["--ni" as string]: ni,
                  }}
                />
              );
            })}

            {/* in-plane attention segments (intra-layer) */}
            <svg
              className="pipeline-nn-membrane__attn"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {attnSegments(li).map((s, k) => {
                const ax = ((s.a % grid) + 0.5) / grid * 100;
                const ay = (Math.floor(s.a / grid) + 0.5) / grid * 100;
                const bx = ((s.b % grid) + 0.5) / grid * 100;
                const by = (Math.floor(s.b / grid) + 0.5) / grid * 100;
                return (
                  <line key={k} x1={ax} y1={ay} x2={bx} y2={by} />
                );
              })}
            </svg>

            {/* inter-layer vertical threads (this membrane → next) */}
            {li < decks - 1 &&
              Array.from({ length: totalNodes }).map((_, ni) => {
                const r = Math.floor(ni / grid);
                const c = ni % grid;
                return (
                  <span
                    key={`t-${li}-${ni}`}
                    className="pipeline-nn-thread"
                    style={{
                      left: `${((c + 0.5) / grid) * 100}%`,
                      top: `${((r + 0.5) / grid) * 100}%`,
                    }}
                  />
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
