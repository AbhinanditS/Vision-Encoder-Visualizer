import { StageId } from "./types";

export interface StageCopy {
  title: string;
  plain: string;
  technical: string;
  shapeIn: string;
  shapeOut: string;
  op: string;
}

export const STAGE_COPY: Record<StageId, StageCopy> = {
  input: {
    title: "Input — raw image",
    plain:
      "The model sees the photo as a flat grid of pixels. Each pixel is just three numbers: red, green, and blue.",
    technical: "Decode image into an RGB tensor. No learning yet — pure data.",
    shapeIn: "image file",
    shapeOut: "224 × 224 × 3",
    op: "decode",
  },
  patch: {
    title: "Patchify — chop into tiles",
    plain:
      "The image is sliced into a grid of small tiles. The model will treat each tile like a single 'word' in a sentence.",
    technical: "Split into non-overlapping patches (e.g. 16×16 px), flatten each.",
    shapeIn: "224 × 224 × 3",
    shapeOut: "196 × (16·16·3) = 196 × 768",
    op: "reshape",
  },
  encode: {
    title: "Encode — tiles → number lists",
    plain:
      "Each tile is converted into a list of numbers that captures what it looks like — its colors, edges, and textures.",
    technical: "Linear projection: flatten(patch) · W_e → vector of size D.",
    shapeIn: "196 × 768",
    shapeOut: "196 × 768",
    op: "linear",
  },
  token: {
    title: "Tokenize — line them up",
    plain:
      "The tiles become a sequence of 'tokens' laid out in a row, like words. A position tag is added so the model still knows where each tile came from.",
    technical: "Add positional embeddings + prepend a learnable [CLS] token.",
    shapeIn: "196 × 768",
    shapeOut: "197 × 768",
    op: "+ pos · [CLS]",
  },
  embedding: {
    title: "Embedding — meaning space",
    plain:
      "Every token is now a coordinate in a huge 'concept space'. Things that look similar end up close together in this space.",
    technical: "D-dim continuous vectors. D = 768 in ViT-Base, 1024+ in larger models.",
    shapeIn: "197 × 768",
    shapeOut: "197 × 768",
    op: "embed",
  },
  transformer: {
    title: "Transformer — tokens talk to each other",
    plain:
      "Across many layers, every token looks at every other token and updates itself. This is how the model figures out context — how the parts of the image relate to each other.",
    technical:
      "12 × (Multi-Head Self-Attention → Feed-Forward → LayerNorm → residual).",
    shapeIn: "197 × 768",
    shapeOut: "197 × 768",
    op: "attn × 12",
  },
  output: {
    title: "Output — what the model understood",
    plain:
      "The [CLS] token now holds a single vector that summarizes the whole image. The model uses it to classify it, describe it, or match it against text.",
    technical: "Pool [CLS] → classifier head / shared text-image similarity space.",
    shapeIn: "197 × 768",
    shapeOut: "768  →  predictions",
    op: "pool · head",
  },
};
