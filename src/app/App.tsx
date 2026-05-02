import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import "./components/pipeline/pipeline.css";
import { Scene } from "./components/pipeline/Scene";
import { ScrubberRail } from "./components/pipeline/ScrubberRail";
import {
  CameraState,
  STAGES,
  StageId,
  stageFromProgress,
} from "./components/pipeline/types";

const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=512&q=70";

const DEFAULT_CAMERA: CameraState = {
  orbit: 32,
  pitch: 2,
  zoom: 0.95,
  panX: 0,
  panY: 0,
};

export default function App() {
  const [progress, setProgress] = useState(0.08);
  const [activeStage, setActiveStage] = useState<StageId>("input");
  const [hoveredPatch, setHoveredPatch] = useState<number | null>(null);
  const [selectedPatch, setSelectedPatch] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [camera, setCamera] = useState<CameraState>(DEFAULT_CAMERA);
  const [spacing, setSpacing] = useState(1);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const tweenRef = useRef<number | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    const node = sceneRef.current;
    if (!node) return;
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        fontEmbedCSS: "",
        filter: (n) => {
          if (n instanceof HTMLLinkElement && n.rel === "stylesheet") return false;
          return true;
        },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `pipeline-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("export failed", err);
    }
  }, []);

  const image = uploadedImage ?? DEMO_IMAGE;

  const tweenProgress = useCallback((target: number, ms = 70) => {
    if (tweenRef.current !== null) cancelAnimationFrame(tweenRef.current);
    const start = performance.now();
    let from = 0;
    setProgress((p) => {
      from = p;
      return p;
    });
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = from + (target - from) * eased;
      setProgress(v);
      if (k < 1) tweenRef.current = requestAnimationFrame(step);
      else tweenRef.current = null;
    };
    tweenRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const s = stageFromProgress(progress);
    setActiveStage((prev) => (prev === s.id ? prev : s.id));
  }, [progress]);

  const goToStage = useCallback(
    (id: StageId) => {
      const s = STAGES.find((x) => x.id === id)!;
      tweenProgress((s.start + s.end) / 2);
      setActiveStage(id);
    },
    [tweenProgress]
  );

  const onScrub = useCallback((p: number) => {
    if (tweenRef.current !== null) {
      cancelAnimationFrame(tweenRef.current);
      tweenRef.current = null;
    }
    setProgress(p);
  }, []);

  const idx = useMemo(
    () => STAGES.findIndex((s) => s.id === activeStage),
    [activeStage]
  );

  const handlePrev = useCallback(() => {
    if (idx > 0) goToStage(STAGES[idx - 1].id);
  }, [idx, goToStage]);
  const handleNext = useCallback(() => {
    if (idx < STAGES.length - 1) goToStage(STAGES[idx + 1].id);
  }, [idx, goToStage]);
  const handleReset = useCallback(() => {
    setCamera(DEFAULT_CAMERA);
    setSpacing(1);
  }, []);
  const handleUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") {
        setProgress((p) => Math.min(1, p + 0.06));
      } else if (e.key === "ArrowLeft") {
        setProgress((p) => Math.max(0, p - 0.06));
      } else if (e.key === "Home") setProgress(0);
      else if (e.key === "End") setProgress(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pipeline-root" data-theme={theme}>
      <div className="pipeline-topbar">
        <button
          type="button"
          className="pipeline-btn"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button
          type="button"
          className="pipeline-btn"
          onClick={handleExport}
          aria-label="Export view as PNG"
        >
          Export
        </button>
      </div>
      <div ref={sceneRef} className="pipeline-scene-wrap">
      <Scene
        progress={progress}
        activeStage={activeStage}
        image={image}
        hoveredPatch={hoveredPatch}
        selectedPatch={selectedPatch}
        onHoverPatch={setHoveredPatch}
        onSelectPatch={(i) => setSelectedPatch(i < 0 ? null : i)}
        camera={camera}
        onCamera={setCamera}
        spacing={spacing}
      />
      </div>
      <ScrubberRail
        progress={progress}
        onProgress={onScrub}
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={idx > 0}
        canNext={idx < STAGES.length - 1}
        onReset={handleReset}
        onUpload={handleUpload}
        spacing={spacing}
        onSpacing={setSpacing}
      />
    </div>
  );
}
