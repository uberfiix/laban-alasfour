import { Component, Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from "@react-three/drei";
import { AlertTriangle, Download, Loader2, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getModelViewerUrl } from "@/lib/model-viewer-url";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";

function CenteredModel({ object, autoRotate }: { object: THREE.Object3D; autoRotate: boolean }) {
  const { scene } = useGLTF(url);
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

function Model({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const extension = url.split("?")[0].split(".").pop()?.toLowerCase();

  if (extension === "obj") {
    return <ObjModel url={url} autoRotate={autoRotate} />;
  }

  if (extension === "3ds") {
    return <TdsModel url={url} autoRotate={autoRotate} />;
  }

  return <GltfModel url={url} autoRotate={autoRotate} />;
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

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
}

export function ModelViewer({ modelUrl, className = "" }: ModelViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} autoRotate={autoRotate} />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={8} blur={2} />
          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 1.5}
          minDistance={1.5}
          maxDistance={10}
        />
      </Canvas>

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
