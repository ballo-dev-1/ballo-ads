"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1773332611628-9e1bdce4881b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1674273913289-8123021e022e?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1768839721719-c5ed97c1fd58?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1679923813998-6603ee2466c5?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1555077292-22a4489e5897?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1722963220475-979db2dbf216?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1710093072228-8c3129f27357?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1556745753-b2904692b3cd?q=80&w=1546&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=2010&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1666887360680-9dc27a1d2753?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1666886573301-b5d526cfd518?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1666887360388-93e684b6474a?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
