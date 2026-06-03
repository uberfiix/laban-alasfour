import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Html,
  PivotControls,
  Grid,
} from "@react-three/drei";
import {
  AlertTriangle,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  Move3D,
  Palette,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getModelViewerUrl } from "@/lib/model-viewer-url";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";

const supportedExtensions = new Set(["glb", "gltf", "obj", "3ds"]);

const ROOM_SIZE = 8;
const WALL_HEIGHT = 4;
const FLOOR_COLOR = "#d8cdb8";
const WALL_COLOR = "#f3ecdd";

const PRESET_COLORS = [
  { name: "خشب طبيعي", hex: "#a47148" },
  { name: "كنزو ذهبي", hex: "#c9a24b" },
  { name: "رمادي حديث", hex: "#6b7280" },
  { name: "أبيض كلاسيك", hex: "#f5f5f0" },
  { name: "أسود فاخر", hex: "#1f2933" },
  { name: "بورجوندي", hex: "#7b2d3a" },
  { name: "أزرق ملكي", hex: "#1e3a5f" },
  { name: "أخضر زمردي", hex: "#0d7a5f" },
];

function getExtension(url: string): string {
  try {
    return new URL(url).pathname.split(".").pop()?.toLowerCase() || "";
  } catch {
    return url.split("?")[0].split(".").pop()?.toLowerCase() || "";
  }
}

function useCenteredModel(object: THREE.Object3D) {
  return useMemo(() => {
    const clone = object.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.2 / maxDim;
    const group = new THREE.Group();
    clone.position.set(-center.x, -box.min.y, -center.z);
    group.add(clone);
    group.scale.setScalar(scale);
    return group;
  }, [object]);
}

function applyColor(object: THREE.Object3D, color: string | null) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const userData = mesh.userData as { __originalMaterial?: THREE.Material | THREE.Material[] };
    if (!userData.__originalMaterial) {
      userData.__originalMaterial = mesh.material;
    }
    if (!color) {
      mesh.material = userData.__originalMaterial!;
      return;
    }
    const tinted = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.15,
      roughness: 0.55,
    });
    mesh.material = tinted;
  });
}

function GltfSource({ url, onReady }: { url: string; onReady: (obj: THREE.Object3D) => void }) {
  const { scene } = useGLTF(url);
  const prepared = useCenteredModel(scene);
  useEffect(() => { onReady(prepared); }, [prepared, onReady]);
  return null;
}
function ObjSource({ url, onReady }: { url: string; onReady: (obj: THREE.Object3D) => void }) {
  const obj = useLoader(OBJLoader, url);
  const prepared = useCenteredModel(obj);
  useEffect(() => { onReady(prepared); }, [prepared, onReady]);
  return null;
}
function TdsSource({ url, onReady }: { url: string; onReady: (obj: THREE.Object3D) => void }) {
  const obj = useLoader(TDSLoader, url);
  const prepared = useCenteredModel(obj);
  useEffect(() => { onReady(prepared); }, [prepared, onReady]);
  return null;
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.85} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, WALL_HEIGHT / 2, -ROOM_SIZE / 2]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, WALL_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Side wall */}
      <mesh position={[-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, WALL_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Subtle grid for placement */}
      <Grid
        position={[0, 0.01, 0]}
        args={[ROOM_SIZE, ROOM_SIZE]}
        cellColor="#b8a98c"
        sectionColor="#8c7a5b"
        cellSize={0.5}
        sectionSize={2}
        fadeDistance={ROOM_SIZE * 1.2}
        infiniteGrid={false}
      />
    </group>
  );
}

function PlacedModel({
  model,
  color,
  rotationY,
  pivotKey,
}: {
  model: THREE.Object3D;
  color: string | null;
  rotationY: number;
  pivotKey: number;
}) {
  useEffect(() => { applyColor(model, color); }, [model, color]);
  return (
    <PivotControls
      key={pivotKey}
      depthTest={false}
      anchor={[0, -1, 0]}
      scale={0.9}
      lineWidth={2.5}
      activeAxes={[true, false, true]}
      disableRotations={false}
      disableScaling
    >
      <group rotation={[0, rotationY, 0]}>
        <primitive object={model} />
      </group>
    </PivotControls>
  );
}

class ModelBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-sm font-medium text-foreground">جاري تجهيز الغرفة الافتراضية...</p>
      </div>
    </Html>
  );
}

function ErrorFallback({ modelUrl, extension }: { modelUrl: string; extension: string }) {
  const unsupported = extension && !supportedExtensions.has(extension);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/70 p-6 text-center" dir="rtl">
      <div className="max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-secondary" />
        <h3 className="font-display text-lg font-bold text-foreground">
          {unsupported ? "صيغة هذا الملف تحتاج برنامج تصميم" : "تعذر عرض النموذج تفاعلياً"}
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {unsupported
            ? `ملف .${extension} متاح للتحميل، بينما التفاعل داخل الغرفة يدعم GLB وGLTF وOBJ و3DS.`
            : "حمّل الملف مباشرة أو جرب منتجاً آخر يدعم التجربة التفاعلية."}
        </p>
        <a href={modelUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex">
          <Button variant="secondary" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            فتح / تحميل الملف
          </Button>
        </a>
      </div>
    </div>
  );
}

interface RoomExperienceProps {
  modelUrl: string;
  initialColors?: string[] | null;
  className?: string;
}

export function RoomExperience({ modelUrl, initialColors, className = "" }: RoomExperienceProps) {
  const viewerUrl = getModelViewerUrl(modelUrl) || modelUrl;
  const extension = getExtension(modelUrl);
  const canRender = supportedExtensions.has(extension);

  const palette = useMemo(() => {
    const fromProduct = (initialColors || [])
      .filter((c) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c))
      .map((hex, idx) => ({ name: `لون ${idx + 1}`, hex }));
    return [...fromProduct, ...PRESET_COLORS];
  }, [initialColors]);

  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [rotationY, setRotationY] = useState(0);
  const [pivotKey, setPivotKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColors, setShowColors] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setColor(null);
    setRotationY(0);
    setPivotKey((k) => k + 1);
  };

  // Auto-dismiss the onboarding hint after a few seconds
  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(() => setShowHint(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showHint]);

  // Keep fullscreen state in sync with the browser
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Default to a collapsed color panel on small screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setShowColors(false);
    }
  }, []);

  const toggleFullscreen = () => {
    const node = containerRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      node.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-muted/40 to-card ${
        isFullscreen ? "rounded-none" : ""
      } ${className}`}
    >
      <Canvas
        shadows
        camera={{ position: [4, 3.2, 4.5], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#f7f1e3"]} />
        <fog attach="fog" args={["#f7f1e3", 12, 22]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          position={[5, 6, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 4, -3]} intensity={0.35} />

        {canRender && (
          <Suspense fallback={<LoadingFallback />}>
            <ModelBoundary fallback={<Html center><ErrorFallback modelUrl={modelUrl} extension={extension} /></Html>}>
              {extension === "obj" && <ObjSource url={viewerUrl} onReady={setModel} />}
              {extension === "3ds" && <TdsSource url={viewerUrl} onReady={setModel} />}
              {(extension === "glb" || extension === "gltf") && <GltfSource url={viewerUrl} onReady={setModel} />}
              <Environment preset="apartment" />
            </ModelBoundary>
          </Suspense>
        )}

        <Room />

        {model && (
          <PlacedModel model={model} color={color} rotationY={rotationY} pivotKey={pivotKey} />
        )}

        <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={ROOM_SIZE} blur={2.4} far={4} />

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, 0]}
        />
      </Canvas>

      {!canRender && <ErrorFallback modelUrl={modelUrl} extension={extension || "unknown"} />}

      {/* Onboarding hint (auto-dismiss) */}
      {canRender && showHint && (
        <div
          className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-3 animate-fade-in"
          dir="rtl"
        >
          <div className="pointer-events-auto flex max-w-[92%] items-center gap-2 rounded-full border border-secondary/40 bg-card/95 px-4 py-2 text-xs font-medium text-foreground shadow-gold backdrop-blur-md">
            <Sparkles className="h-4 w-4 shrink-0 text-secondary" />
            <span className="leading-5">اسحب لتدوير الغرفة • اسحب المقابض الملوّنة لتحريك القطعة • غيّر اللون والتشطيب</span>
            <button
              onClick={() => setShowHint(false)}
              className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="إغلاق التلميح"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top-right action bar: colors toggle + fullscreen */}
      {canRender && (
        <div className="pointer-events-auto absolute right-3 top-3 z-10 flex flex-col items-end gap-2" dir="rtl">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label={showColors ? "إخفاء الألوان" : "عرض الألوان"}
              className="h-9 w-9 rounded-xl border-border/60 bg-card/90 backdrop-blur-md"
              onClick={() => setShowColors((v) => !v)}
            >
              <Palette className={`h-4 w-4 ${showColors ? "text-secondary" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
              className="h-9 w-9 rounded-xl border-border/60 bg-card/90 backdrop-blur-md"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {showColors && (
            <div className="w-[230px] max-w-[78vw] rounded-2xl border border-border/60 bg-card/95 p-3 shadow-soft backdrop-blur-md animate-scale-in">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Palette className="h-3.5 w-3.5 text-secondary" />
                غيّر لون القطعة
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => setColor(null)}
                  title="اللون الأصلي"
                  className={`h-7 w-7 rounded-full border-2 bg-gradient-to-br from-muted to-background transition-transform hover:scale-110 ${
                    color === null ? "border-secondary ring-2 ring-secondary/40" : "border-border"
                  }`}
                />
                {palette.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      color === c.hex ? "border-secondary ring-2 ring-secondary/40" : "border-border/70"
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom controls */}
      {canRender && (
        <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center gap-2" dir="rtl">
          <div className="hidden items-center gap-2 rounded-xl border border-border/60 bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-md sm:flex">
            <Move3D className="h-3.5 w-3.5 text-secondary" />
            اسحب المقابض الملوّنة لتحريك القطعة
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 rounded-xl border-border/60 bg-card/90 text-xs backdrop-blur-md"
            onClick={() => setRotationY((r) => r + Math.PI / 8)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            تدوير
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-xl border-border/60 bg-card/90 text-xs backdrop-blur-md"
            onClick={reset}
          >
            إعادة ضبط
          </Button>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 bottom-3 z-10 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-gold">
        تجربة VR تفاعلية
      </div>
    </div>
  );
}