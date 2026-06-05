import { Component, Suspense, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from "@react-three/drei";
import { AlertTriangle, Download, Loader2, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getModelViewerUrl } from "@/lib/model-viewer-url";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";

const supportedViewerExtensions = new Set(["glb", "gltf", "obj", "3ds"]);

function getModelExtension(modelUrl: string): string {
  try {
    return new URL(modelUrl).pathname.split(".").pop()?.toLowerCase() || "";
  } catch {
    return modelUrl.split("?")[0].split(".").pop()?.toLowerCase() || "";
  }
}

function CenteredModel({ object, autoRotate }: { object: THREE.Object3D; autoRotate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const model = useMemo(() => object.clone(true), [object]);

  useFrame((_, delta) => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += delta * 0.3;
    }
  });

  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return {
      scale: 2 / maxDim,
      center: box.getCenter(new THREE.Vector3()),
    };
  }, [model]);

  return (
    <group ref={ref} scale={scale} position={[-center.x * scale, -center.y * scale, -center.z * scale]}>
      <primitive object={model} />
    </group>
  );
}

function GltfModel({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const { scene } = useGLTF(url);
  return <CenteredModel object={scene} autoRotate={autoRotate} />;
}

function ObjModel({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const object = useLoader(OBJLoader, url);
  return <CenteredModel object={object} autoRotate={autoRotate} />;
}

function TdsModel({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const object = useLoader(TDSLoader, url);
  return <CenteredModel object={object} autoRotate={autoRotate} />;
}

function Model({ url, extension, autoRotate }: { url: string; extension: string; autoRotate: boolean }) {

  if (extension === "obj") {
    return <ObjModel url={url} autoRotate={autoRotate} />;
  }

  if (extension === "3ds") {
    return <TdsModel url={url} autoRotate={autoRotate} />;
  }

  return <GltfModel url={url} autoRotate={autoRotate} />;
}

class ModelLoadBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-sm font-medium text-muted-foreground">جاري تحميل النموذج ثلاثي الأبعاد...</p>
      </div>
    </Html>
  );
}

function ModelErrorFallback({ modelUrl, extension }: { modelUrl: string; extension: string }) {
  const unsupported = extension && !supportedViewerExtensions.has(extension);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/60 p-6 text-center" dir="rtl">
      <div className="max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-secondary" />
        <h3 className="font-display text-lg font-bold text-foreground">
          {unsupported ? "صيغة هذا الملف تحتاج برنامج تصميم" : "تعذر عرض النموذج داخل المتصفح"}
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {unsupported
            ? `ملف .${extension} متاح للتحميل، بينما العرض التفاعلي يدعم GLB وGLTF وOBJ و3DS.`
            : "يمكنك تحميل الملف مباشرة أو تجربة نموذج آخر من المنتجات الداعمة."}
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

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
}

export function ModelViewer({ modelUrl, className = "" }: ModelViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerUrl = getModelViewerUrl(modelUrl) || modelUrl;
  const extension = getModelExtension(modelUrl);
  const canRenderModel = supportedViewerExtensions.has(extension);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 ${className}`}
    >
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />

        {canRenderModel && (
          <Suspense fallback={<LoadingFallback />}>
            <ModelLoadBoundary fallback={<Html center><ModelErrorFallback modelUrl={modelUrl} extension={extension} /></Html>}>
              <Model url={viewerUrl} extension={extension} autoRotate={autoRotate} />
              <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={8} blur={2} />
              <Environment preset="apartment" />
            </ModelLoadBoundary>
          </Suspense>
        )}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 1.5}
          minDistance={1.5}
          maxDistance={10}
        />
      </Canvas>

      {!canRenderModel && <ModelErrorFallback modelUrl={modelUrl} extension={extension || "unknown"} />}

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2" dir="rtl">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/60 bg-card/80 backdrop-blur-sm"
          onClick={() => setAutoRotate(!autoRotate)}
        >
          <RotateCcw className={`ml-1 h-4 w-4 ${autoRotate ? "animate-spin" : ""}`} />
          {autoRotate ? "إيقاف الدوران" : "تدوير تلقائي"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-border/60 bg-card/80 backdrop-blur-sm"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* VR Badge */}
      <div className="absolute right-4 top-4 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-gold">
        عرض ثلاثي الأبعاد
      </div>
    </div>
  );
}
