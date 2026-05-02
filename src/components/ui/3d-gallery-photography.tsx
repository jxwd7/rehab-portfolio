import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type ImageItem = string | { src: string; alt?: string };

interface FadeSettings {
  fadeIn: {
    start: number;
    end: number;
  };
  fadeOut: {
    start: number;
    end: number;
  };
}

interface BlurSettings {
  blurIn: {
    start: number;
    end: number;
  };
  blurOut: {
    start: number;
    end: number;
  };
  maxBlur: number;
}

interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  zSpacing?: number;
  visibleCount?: number;
  falloff?: { near: number; far: number };
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  className?: string;
  style?: React.CSSProperties;
}

interface PlaneData {
  index: number;
  z: number;
  imageIndex: number;
  x: number;
  y: number;
}

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

const getTextureAspect = (texture?: THREE.Texture) => {
  const image = texture?.image as { width?: number; height?: number } | undefined;
  return image?.width && image?.height ? image.width / image.height : 1;
};

const createClothMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          float secondaryWave = sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
          flagWave += secondaryWave;
        }

        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(map, vUv);

        if (blurAmount > 0.0) {
          vec2 texelSize = vec2(0.0012, 0.0012);
          vec4 blurred = vec4(0.0);
          float total = 0.0;

          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }

        float curveHighlight = abs(scrollForce) * 0.005;
        color.rgb += vec3(curveHighlight);
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });

function GalleryScene({
  images,
  speed = 1,
  visibleCount = 8,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.15 },
    fadeOut: { start: 0.85, end: 0.95 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.9, end: 1.0 },
    maxBlur: 3.0,
  },
}: Omit<InfiniteGalleryProps, "className" | "style">) {
  const scrollVelocity = useRef(0);
  const autoPlay = useRef(true);
  const lastInteraction = useRef(Date.now());
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);

  const normalizedImages = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img,
      ),
    [images],
  );

  const textures = useTexture(normalizedImages.map((img) => img.src)) as THREE.Texture[];

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [textures]);

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount],
  );

  useEffect(
    () => () => {
      materials.forEach((material) => material.dispose());
    },
    [materials],
  );

  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];

    for (let i = 0; i < visibleCount; i += 1) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;

      positions.push({
        x: (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) / 3,
        y: (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4,
      });
    }

    return positions;
  }, [visibleCount]);

  const totalImages = normalizedImages.length;
  const depthRange = DEFAULT_DEPTH_RANGE;

  const planesData = useRef<PlaneData[]>(
    Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    })),
  );

  useEffect(() => {
    planesData.current = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z:
        visibleCount > 0
          ? ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange
          : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }));
  }, [depthRange, spatialPositions, totalImages, visibleCount]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      scrollVelocity.current += event.deltaY * 0.01 * speed;
      autoPlay.current = false;
      lastInteraction.current = Date.now();
    },
    [speed],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        scrollVelocity.current -= 2 * speed;
        autoPlay.current = false;
        lastInteraction.current = Date.now();
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        scrollVelocity.current += 2 * speed;
        autoPlay.current = false;
        lastInteraction.current = Date.now();
      }
    },
    [speed],
  );

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    canvas?.addEventListener("wheel", handleWheel, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas?.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, handleWheel]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (Date.now() - lastInteraction.current > 3000) {
        autoPlay.current = true;
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (autoPlay.current) {
      scrollVelocity.current += 0.3 * delta;
    }

    scrollVelocity.current *= 0.95;

    const time = state.clock.getElapsedTime();
    const velocity = scrollVelocity.current;
    const imageAdvance =
      totalImages > 0 ? visibleCount % totalImages || totalImages : 0;
    const halfRange = depthRange / 2;

    planesData.current.forEach((plane, i) => {
      let newZ = plane.z + velocity * delta * 10;
      let wrapsForward = 0;
      let wrapsBackward = 0;

      if (newZ >= depthRange) {
        wrapsForward = Math.floor(newZ / depthRange);
        newZ -= depthRange * wrapsForward;
      } else if (newZ < 0) {
        wrapsBackward = Math.ceil(-newZ / depthRange);
        newZ += depthRange * wrapsBackward;
      }

      if (wrapsForward > 0 && imageAdvance > 0 && totalImages > 0) {
        plane.imageIndex = (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
      }

      if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsBackward * imageAdvance;
        plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
      }

      plane.z = ((newZ % depthRange) + depthRange) % depthRange;
      plane.x = spatialPositions[i]?.x ?? 0;
      plane.y = spatialPositions[i]?.y ?? 0;

      const normalizedPosition = plane.z / depthRange;
      let opacity = 1;

      if (
        normalizedPosition >= fadeSettings.fadeIn.start &&
        normalizedPosition <= fadeSettings.fadeIn.end
      ) {
        opacity =
          (normalizedPosition - fadeSettings.fadeIn.start) /
          (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
      } else if (normalizedPosition < fadeSettings.fadeIn.start) {
        opacity = 0;
      } else if (
        normalizedPosition >= fadeSettings.fadeOut.start &&
        normalizedPosition <= fadeSettings.fadeOut.end
      ) {
        opacity =
          1 -
          (normalizedPosition - fadeSettings.fadeOut.start) /
            (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
      } else if (normalizedPosition > fadeSettings.fadeOut.end) {
        opacity = 0;
      }

      let blur = 0;

      if (
        normalizedPosition >= blurSettings.blurIn.start &&
        normalizedPosition <= blurSettings.blurIn.end
      ) {
        blur =
          blurSettings.maxBlur *
          (1 -
            (normalizedPosition - blurSettings.blurIn.start) /
              (blurSettings.blurIn.end - blurSettings.blurIn.start));
      } else if (normalizedPosition < blurSettings.blurIn.start) {
        blur = blurSettings.maxBlur;
      } else if (
        normalizedPosition >= blurSettings.blurOut.start &&
        normalizedPosition <= blurSettings.blurOut.end
      ) {
        blur =
          blurSettings.maxBlur *
          ((normalizedPosition - blurSettings.blurOut.start) /
            (blurSettings.blurOut.end - blurSettings.blurOut.start));
      } else if (normalizedPosition > blurSettings.blurOut.end) {
        blur = blurSettings.maxBlur;
      }

      const texture = textures[plane.imageIndex];
      const aspect = getTextureAspect(texture);
      const scale: [number, number, number] =
        aspect > 1 ? [2.2 * aspect, 2.2, 1] : [2.2, 2.2 / aspect, 1];

      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.set(plane.x, plane.y, plane.z - halfRange);
        mesh.scale.set(scale[0], scale[1], scale[2]);
      }

      const material = materials[i];
      if (material?.uniforms) {
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = velocity;
        material.uniforms.opacity.value = Math.max(0, Math.min(1, opacity));
        material.uniforms.blurAmount.value = Math.max(
          0,
          Math.min(blurSettings.maxBlur, blur),
        );
        material.uniforms.map.value = texture;
      }
    });
  });

  if (normalizedImages.length === 0) return null;

  return (
    <>
      {planesData.current.map((plane, i) => {
        const material = materials[i];
        const texture = textures[plane.imageIndex];
        if (!material || !texture) return null;

        const aspect = getTextureAspect(texture);
        const scale: [number, number, number] =
          aspect > 1 ? [2.2 * aspect, 2.2, 1] : [2.2, 2.2 / aspect, 1];

        return (
          <mesh
            key={plane.index}
            ref={(node) => {
              meshRefs.current[i] = node;
            }}
            position={[plane.x, plane.y, plane.z - depthRange / 2]}
            scale={scale}
            material={material}
            onPointerEnter={() => {
              material.uniforms.isHovered.value = 1.0;
            }}
            onPointerLeave={() => {
              material.uniforms.isHovered.value = 0.0;
            }}
          >
            <planeGeometry args={[1, 1, 32, 32]} />
          </mesh>
        );
      })}
    </>
  );
}

function FallbackGallery({ images }: { images: ImageItem[] }) {
  const normalizedImages = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img,
      ),
    [images],
  );

  return (
    <div className="flex h-full flex-col items-center justify-center bg-stone-100 p-4">
      <p className="mb-4 text-sm text-stone-600">Showing still gallery images.</p>
      <div className="grid max-h-96 grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
        {normalizedImages.map((img) => (
          <img
            key={img.src}
            src={img.src || "/placeholder.svg"}
            alt={img.alt}
            className="h-32 w-full rounded object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteGallery({
  images,
  className = "h-96 w-full",
  style,
  speed = 1,
  zSpacing,
  visibleCount = 8,
  falloff,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4, end: 0.43 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
}: InfiniteGalleryProps) {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <GalleryScene
          images={images}
          speed={speed}
          zSpacing={zSpacing}
          visibleCount={visibleCount}
          falloff={falloff}
          fadeSettings={fadeSettings}
          blurSettings={blurSettings}
        />
      </Canvas>
    </div>
  );
}
