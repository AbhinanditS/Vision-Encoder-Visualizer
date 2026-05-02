import { PATCH_GRID } from "./types";

interface Props {
  image: string | null;
  embeddingDims?: number;
}

const MOCK_PREDICTIONS = [
  { label: "object · foreground", value: 0.82 },
  { label: "scene · indoor", value: 0.61 },
  { label: "texture · soft", value: 0.44 },
  { label: "color · warm", value: 0.31 },
  { label: "geometry · curved", value: 0.18 },
];

export function OutputReadout({ image, embeddingDims = 48 }: Props) {
  const vec = Array.from({ length: embeddingDims }).map(
    (_, i) => 0.5 + 0.5 * Math.sin((i + 1) * 1.7)
  );
  return (
    <div className="pipeline-output-readout" aria-label="Output readout">
      <div className="pipeline-output-readout__row">
        <div
          className="pipeline-output-readout__recon"
          aria-label="Reconstruction"
        >
          <div
            className="pipeline-output-readout__cells"
            style={{ ["--patch-grid" as string]: PATCH_GRID }}
          >
            {Array.from({ length: PATCH_GRID * PATCH_GRID }).map((_, i) => (
              <span
                key={i}
                className="pipeline-output-readout__cell"
                style={{ ["--i" as string]: i }}
              />
            ))}
          </div>
          {image && (
            <img
              src={image}
              alt=""
              className="pipeline-output-readout__image"
              aria-hidden
            />
          )}
          <span className="pipeline-output-readout__caption">reconstruction</span>
        </div>

        <div
          className="pipeline-output-readout__predictions"
          aria-label="Top similarity matches"
        >
          <span className="pipeline-output-readout__caption">
            top matches (mock)
          </span>
          <ul>
            {MOCK_PREDICTIONS.map((p) => (
              <li key={p.label}>
                <span className="pipeline-output-readout__pred-label">
                  {p.label}
                </span>
                <span
                  className="pipeline-output-readout__pred-bar"
                  style={{ ["--v" as string]: p.value }}
                  aria-hidden
                />
                <span className="pipeline-output-readout__pred-val">
                  {p.value.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pipeline-output-readout__embed-wrap">
        <span className="pipeline-output-readout__caption">
          [CLS] embedding · 768-d (showing {embeddingDims})
        </span>
        <div
          className="pipeline-output-readout__embedding"
          aria-label="Final embedding vector"
        >
          {vec.map((v, i) => (
            <span
              key={i}
              className="pipeline-output-readout__bar"
              style={{ ["--v" as string]: v }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
