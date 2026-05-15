"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1638959882708-9503b1cd595f?w=800&q=80",
  "https://images.unsplash.com/photo-1644469709847-454ef12d5144?w=800&q=80",
  "https://images.unsplash.com/photo-1731848356615-90cba9fdc862?w=800&q=80",
  "https://images.unsplash.com/photo-1688388040015-c3985c83a12d?w=800&q=80",
  "https://images.unsplash.com/photo-1726591383648-5b5cbe1da1a2?w=800&q=80",
  "https://images.unsplash.com/photo-1651745314014-a9432659af40?w=800&q=80",
  "https://images.unsplash.com/photo-1635585244467-134d68caad51?w=800&q=80",
  "https://images.unsplash.com/photo-1517498327491-f903e1e281cd?w=800&q=80",
  "https://images.unsplash.com/photo-1584969405346-5230ae2bc4fc?w=800&q=80",
  "https://images.unsplash.com/photo-1615212049275-95561aebe1b4?w=800&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
  "https://images.unsplash.com/photo-1516727003284-a96541e51e9c?w=800&q=80",
  "https://images.unsplash.com/photo-1530735038726-a73fd6e6a349?w=800&q=80",
  "https://images.unsplash.com/photo-1548918901-9b31223c5c3a?w=800&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  "https://images.unsplash.com/photo-1553544260-f87e671974ee?w=800&q=80",
  "https://images.unsplash.com/photo-1512084747998-038941f49b84?w=800&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
  "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=80",
  "https://images.unsplash.com/photo-1532170579297-281918c8ae72?w=800&q=80",
  "https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=800&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&q=80",
  "https://images.unsplash.com/photo-1593010932917-92bd21088dee?w=800&q=80",
];

interface Props {
  progressRef: React.MutableRefObject<number>;
}

export function SpiralGallery({ progressRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container: HTMLDivElement = containerRef.current;
    const canvas: HTMLCanvasElement = canvasRef.current;

    const N = IMAGE_URLS.length;

    const config = {
      imageHeight: 7,
      curvature: -0.030,
      gapSize: 0,
      spiralRadius: 3.5,
      spiralTurns: 2.8 + (N - 21) * 0.1,
      spiralHeight: 12 + (N - 21) * 0.25,
      centerX: -2,
      centerY: 4.38,
      centerZ: 0,
    };

    const baseRotation = { x: -0.18, z: 0.12 };
    const dragRotation = { x: 0, z: 0 };

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let spiralMesh: THREE.Mesh;
    let tiltGroup: THREE.Group;
    let shaderMaterial: THREE.ShaderMaterial;
    let rafId: number;
    let resizeObserver: ResizeObserver;
    let destroyed = false;

    // Scroll driven by GSAP progress
    let scrollOffset = 0;
    let lastProgress = 0;

    // Auto-tilt spring — lean in the direction of scroll travel
    let autoTiltX = 0;
    let autoTiltZ = 0;

    // Drag state
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const imageRatios: number[] = [];
    const originalPositions: Array<{ offsetX: number; offsetY: number; offsetZ: number }> = [];

    // ── UV offset update ──────────────────────────────────────────────────────
    function updateUVOffset() {
      if (!shaderMaterial) return;
      let o = scrollOffset % 1.0;
      if (o < 0) o += 1.0;
      shaderMaterial.uniforms.offset.value = o;
    }

    // ── Geometry build (matches original faithfully) ──────────────────────────
    function rebuildGeometry() {
      const widths = imageRatios.map(r => r * config.imageHeight);
      const totalWidth = widths.reduce((a, b) => a + b, 0);
      const geometry = new THREE.PlaneGeometry(
        totalWidth, config.imageHeight,
        200 + N * 20, 24,
      );
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      const uvs = geometry.attributes.uv as THREE.BufferAttribute;

      // Save original flat positions before any deformation
      const origX: number[] = [];
      const origY: number[] = [];
      for (let i = 0; i < pos.count; i++) {
        origX.push(pos.getX(i));
        origY.push(pos.getY(i));
      }

      // Cumulative UV boundaries per image
      const cum = [0];
      for (let i = 0; i < N; i++) cum.push(cum[i] + widths[i] / totalWidth);

      // Remap UVs so each segment maps cleanly to one image
      for (let i = 0; i < uvs.count; i++) {
        let u = Math.max(0, Math.min(0.999999, uvs.getX(i)));
        let found = false;
        for (let j = 0; j < N; j++) {
          if (u >= cum[j] && u < cum[j + 1]) {
            const localU = (u - cum[j]) / (cum[j + 1] - cum[j]);
            if (localU > 1 - config.gapSize) {
              uvs.setX(i, cum[j + 1] - 0.001);
            } else {
              const scaled = Math.max(0.001, Math.min(0.999, localU / (1 - config.gapSize)));
              uvs.setX(i, cum[j] + scaled * (cum[j + 1] - cum[j]));
            }
            found = true;
            break;
          }
        }
        if (!found) uvs.setX(i, cum[N] - 0.001);
      }

      // Curvature pass (matches original — applied then overwritten by spiral)
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const nx = x / (totalWidth / 2);
        const curve = config.curvature * 0.4 * (nx * nx - 1);
        pos.setXYZ(i, x, y, -curve);
      }

      // Spiral pass — bends the flat plane into a 3-D helix
      for (let i = 0; i < pos.count; i++) {
        const x = origX[i];
        const y = origY[i];
        let t = Math.max(0, Math.min(1, (x + totalWidth / 2) / totalWidth));

        const angle = t * Math.PI * 2 * config.spiralTurns;
        const radius = config.spiralRadius * (1 - t * 0.12);
        let px = Math.sin(angle) * radius;
        let pz = Math.cos(angle) * radius;
        let py = (t - 0.5) * config.spiralHeight + y * 0.35;

        if (!originalPositions[i]) {
          originalPositions[i] = {
            offsetX: (Math.random() - 0.5) * 0.001,
            offsetY: (Math.random() - 0.5) * 0.001,
            offsetZ: (Math.random() - 0.5) * 0.001,
          };
        }

        pos.setXYZ(
          i,
          px + originalPositions[i].offsetX,
          py + originalPositions[i].offsetY,
          pz + originalPositions[i].offsetZ,
        );
      }

      geometry.computeVertexNormals();
      const old = spiralMesh.geometry;
      spiralMesh.geometry = geometry;
      old?.dispose();

      if (shaderMaterial) shaderMaterial.uniforms.gap.value = config.gapSize;
    }

    // ── Master texture atlas ──────────────────────────────────────────────────
    function createMasterTexture(): Promise<THREE.CanvasTexture> {
      return new Promise(resolve => {
        const texCanvas = document.createElement("canvas");
        const ctx = texCanvas.getContext("2d")!;
        const baseH = 500;
        let loaded = 0;
        const imgs: Array<{ img: HTMLImageElement; width: number }> = [];

        function finish() {
          const totalW = imgs.reduce((s, d) => s + (d?.width ?? 0), 0);
          texCanvas.width = totalW;
          texCanvas.height = baseH;
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, totalW, baseH);
          let ox = 0;
          imgs.forEach(d => {
            if (d?.img) ctx.drawImage(d.img, ox, 0, d.width, baseH);
            ox += d?.width ?? 0;
          });
          const tex = new THREE.CanvasTexture(texCanvas);
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          resolve(tex);
        }

        IMAGE_URLS.forEach((url, idx) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            imageRatios[idx] = img.naturalWidth / img.naturalHeight;
            imgs[idx] = { img, width: baseH * imageRatios[idx] };
            if (++loaded === N) finish();
          };
          img.onerror = () => {
            imageRatios[idx] = 0.8;
            if (++loaded === N) finish();
          };
          img.src = url;
        });
      });
    }

    // ── Drag: rotates tiltGroup ───────────────────────────────────────────────
    function setupDrag() {
      container.style.cursor = "grab";

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
        container.style.cursor = "grabbing";
        e.preventDefault();
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        dragRotation.z += dx * 0.002;
        dragRotation.x -= dy * 0.002;
        dragRotation.x = Math.max(-0.35, Math.min(0.35, dragRotation.x));
        dragRotation.z = Math.max(-0.35, Math.min(0.35, dragRotation.z));
        prevMouse = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isDragging = false;
        container.style.cursor = "grab";
      };

      container.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      // Store for cleanup
      return () => {
        container.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }

    // ── Scene init ────────────────────────────────────────────────────────────
    let cleanupDrag: (() => void) | undefined;

    async function init() {
      const w = container.clientWidth;
      const h = container.clientHeight;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
      // Offset camera left of the spiral center so the spiral appears right in canvas
      camera.position.set(config.centerX - 1.5, 3.5, 9);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(5, 8, 5);
      scene.add(dir);

      tiltGroup = new THREE.Group();
      tiltGroup.rotation.x = baseRotation.x;
      tiltGroup.rotation.z = baseRotation.z;
      scene.add(tiltGroup);

      const texture = await createMasterTexture();
      if (destroyed) { texture.dispose(); return; }

      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: texture },
          gap: { value: config.gapSize },
          offset: { value: 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float offset;
          varying vec2 vUv;
          void main() {
            float u = vUv.x + offset;
            if (u >= 1.0) u -= 1.0;
            if (u < 0.0) u += 1.0;
            gl_FragColor = texture2D(map, vec2(u, vUv.y));
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      spiralMesh = new THREE.Mesh(new THREE.BufferGeometry(), shaderMaterial);
      spiralMesh.position.set(config.centerX, config.centerY, config.centerZ);
      spiralMesh.rotation.x = 0.35;
      spiralMesh.rotation.y = 0;
      tiltGroup.add(spiralMesh);

      rebuildGeometry();
      cleanupDrag = setupDrag();

      resizeObserver = new ResizeObserver(() => {
        if (!renderer || !camera) return;
        const rw = container.clientWidth;
        const rh = container.clientHeight;
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      });
      resizeObserver.observe(container);

      animate();
    }

    // ── Render loop: GSAP progress → UV offset + auto-tilt ───────────────────
    function animate() {
      rafId = requestAnimationFrame(animate);
      const p = progressRef.current;
      const delta = p - lastProgress;

      if (delta !== 0) {
        scrollOffset += delta * 1.0;
        updateUVOffset();
        lastProgress = p;
      }

      // Spring auto-tilt toward scroll velocity, decay to zero when idle
      const targetX = delta * 18;   // lean back/forward with scroll
      const targetZ = delta * 10;   // lean sideways
      autoTiltX += (targetX - autoTiltX) * 0.12;
      autoTiltZ += (targetZ - autoTiltZ) * 0.12;

      if (tiltGroup) {
        tiltGroup.rotation.x = baseRotation.x + dragRotation.x + Math.max(-0.28, Math.min(0.28, autoTiltX));
        tiltGroup.rotation.z = baseRotation.z + dragRotation.z + Math.max(-0.28, Math.min(0.28, autoTiltZ));
      }

      renderer?.render(scene, camera);
    }

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      cleanupDrag?.();
      resizeObserver?.disconnect();
      (shaderMaterial?.uniforms.map.value as THREE.Texture | undefined)?.dispose();
      shaderMaterial?.dispose();
      spiralMesh?.geometry.dispose();
      renderer?.dispose();
    };
  }, [progressRef]);

  return (
    <div ref={containerRef} className="who-spiral-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
