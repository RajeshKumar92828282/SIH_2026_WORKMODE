"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Compass, Minimize2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Aircraft3DHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggle3DHero } = useAppStore();
  const [loadStatus, setLoadStatus] = useState("INITIALIZING TELEMETRY...");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let width  = container.clientWidth  || 800;
    let height = container.clientHeight || 450;

    // ── 1. Scene & Camera ──────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000d1a, 0.018);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 12);
    camera.lookAt(0, 0.2, 0);

    // ── 2. Renderer ────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias:        true,
      alpha:            false,   // solid background — no see-through
      powerPreference:  "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping          = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure  = 1.45;
    container.appendChild(renderer.domElement);

    // ── 3. Sky Gradient Background (canvas texture) ────────────
    const skyCanvas  = document.createElement("canvas");
    skyCanvas.width  = 1024;
    skyCanvas.height = 512;
    const skyCtx     = skyCanvas.getContext("2d")!;

    // Deep night-to-horizon atmospheric gradient
    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0.00, "#000510");   // zenith — near-black space
    skyGrad.addColorStop(0.30, "#001028");   // upper sky
    skyGrad.addColorStop(0.55, "#001e40");   // mid sky
    skyGrad.addColorStop(0.72, "#002d5a");   // lower sky
    skyGrad.addColorStop(0.85, "#0a4a7a");   // horizon glow
    skyGrad.addColorStop(0.93, "#0e6a9a");   // bright horizon
    skyGrad.addColorStop(1.00, "#1a8abd");   // horizon edge
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, 1024, 512);

    // Sun disc glow at upper-right
    const sunGrad = skyCtx.createRadialGradient(780, 90, 4, 780, 90, 200);
    sunGrad.addColorStop(0.0,  "rgba(255,255,255,0.95)");
    sunGrad.addColorStop(0.08, "rgba(255,248,220,0.85)");
    sunGrad.addColorStop(0.25, "rgba(255,220,100,0.40)");
    sunGrad.addColorStop(0.55, "rgba(135,214,235,0.18)");
    sunGrad.addColorStop(1.0,  "rgba(0,0,0,0.0)");
    skyCtx.fillStyle = sunGrad;
    skyCtx.fillRect(0, 0, 1024, 512);

    // Horizon cyan accent band
    const horizGrad = skyCtx.createLinearGradient(0, 380, 0, 430);
    horizGrad.addColorStop(0,   "rgba(0,184,217,0.0)");
    horizGrad.addColorStop(0.5, "rgba(0,184,217,0.22)");
    horizGrad.addColorStop(1,   "rgba(0,184,217,0.0)");
    skyCtx.fillStyle = horizGrad;
    skyCtx.fillRect(0, 380, 1024, 50);

    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.mapping     = THREE.EquirectangularReflectionMapping;
    skyTexture.colorSpace  = THREE.SRGBColorSpace;
    scene.background       = skyTexture;

    // ── 4. Environment Map (reflections) ──────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRT           = pmremGenerator.fromEquirectangular(skyTexture);
    scene.environment     = envRT.texture;
    pmremGenerator.dispose();

    // ── 5. Star Field ──────────────────────────────────────────
    const starCount  = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes  = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI * 0.55;   // upper hemisphere only
      const r     = 380;
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi) + 30;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      starSizes[i] = 0.6 + Math.random() * 2.0;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("size",     new THREE.BufferAttribute(starSizes, 1));

    // Star canvas texture
    const starCanvas = document.createElement("canvas");
    starCanvas.width = starCanvas.height = 32;
    const sc = starCanvas.getContext("2d")!;
    const sg = sc.createRadialGradient(16, 16, 0, 16, 16, 14);
    sg.addColorStop(0,   "rgba(255,255,255,1)");
    sg.addColorStop(0.3, "rgba(200,235,255,0.85)");
    sg.addColorStop(1,   "rgba(0,0,0,0)");
    sc.fillStyle = sg;
    sc.fillRect(0, 0, 32, 32);
    const starTex = new THREE.CanvasTexture(starCanvas);

    const starMat = new THREE.PointsMaterial({
      size:            1.4,
      sizeAttenuation: true,
      map:             starTex,
      transparent:     true,
      opacity:         0.9,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
      vertexColors:    false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── 6. Cloud Layers (billboard sprites) ───────────────────
    function makeCloudTexture(w: number, h: number, opacity: number): THREE.CanvasTexture {
      const cvs = document.createElement("canvas");
      cvs.width  = w;
      cvs.height = h;
      const ctx  = cvs.getContext("2d")!;
      // multiple overlapping radial blobs
      const blobs = [
        [w * 0.3, h * 0.5, h * 0.38],
        [w * 0.5, h * 0.45, h * 0.42],
        [w * 0.68,h * 0.5, h * 0.35],
        [w * 0.15,h * 0.55, h * 0.28],
        [w * 0.82,h * 0.55, h * 0.30],
      ];
      blobs.forEach(([cx, cy, r]) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,   `rgba(200,230,255,${opacity})`);
        g.addColorStop(0.6, `rgba(180,215,255,${opacity * 0.5})`);
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      return new THREE.CanvasTexture(cvs);
    }

    const cloudDefs = [
      { x: -28, y: -1.2, z: -40, sx: 36, sy: 10, opacity: 0.18, speed: 0.008 },
      { x:  18, y: -2.0, z: -55, sx: 44, sy: 12, opacity: 0.14, speed: 0.005 },
      { x: -10, y:  0.5, z: -30, sx: 30, sy:  8, opacity: 0.22, speed: 0.010 },
      { x:  35, y: -0.8, z: -45, sx: 40, sy: 11, opacity: 0.16, speed: 0.006 },
      { x: -42, y: -1.5, z: -60, sx: 50, sy: 14, opacity: 0.12, speed: 0.004 },
    ];

    const cloudSprites: { sprite: THREE.Sprite; speed: number; baseX: number }[] = [];
    cloudDefs.forEach(({ x, y, z, sx, sy, opacity, speed }) => {
      const tex  = makeCloudTexture(512, 128, opacity);
      const mat  = new THREE.SpriteMaterial({
        map:         tex,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.NormalBlending,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y, z);
      sprite.scale.set(sx, sy, 1);
      scene.add(sprite);
      cloudSprites.push({ sprite, speed, baseX: x });
    });

    // ── 7. Perspective Grid (runway / horizon) ─────────────────
    const gridHelper = new THREE.GridHelper(200, 40, 0x00b8d9, 0x003a5a);
    gridHelper.position.set(0, -5.5, -30);
    (gridHelper.material as THREE.LineBasicMaterial).opacity    = 0.18;
    (gridHelper.material as THREE.LineBasicMaterial).transparent = true;
    scene.add(gridHelper);

    // ── 8. Atmospheric Glow Rings (engine trail rings) ─────────
    function addGlowRing(y: number, r: number, col: number, op: number) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.06, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: col, side: THREE.DoubleSide,
        transparent: true, opacity: op,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, y, -8);
      scene.add(ring);
      return ring;
    }
    const rings = [
      addGlowRing(-1.8, 1.2,  0x00b8d9, 0.35),
      addGlowRing(-1.8, 1.85, 0x00b8d9, 0.18),
      addGlowRing(-1.8, 2.6,  0x0077aa, 0.10),
    ];

    // ── 9. Sun Sprite ──────────────────────────────────────────
    const flareCanvas = document.createElement("canvas");
    flareCanvas.width = flareCanvas.height = 256;
    const fc = flareCanvas.getContext("2d")!;
    const fg = fc.createRadialGradient(128, 128, 3, 128, 128, 120);
    fg.addColorStop(0.00, "rgba(255,255,255,1.0)");
    fg.addColorStop(0.12, "rgba(255,248,210,0.88)");
    fg.addColorStop(0.35, "rgba(255,220,100,0.50)");
    fg.addColorStop(0.65, "rgba(135,214,235,0.20)");
    fg.addColorStop(1.00, "rgba(0,0,0,0.0)");
    fc.fillStyle = fg;
    fc.fillRect(0, 0, 256, 256);
    const flareMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(flareCanvas),
      transparent: true, opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const sunSprite = new THREE.Sprite(flareMat);
    sunSprite.position.set(12, 14, -10);
    sunSprite.scale.set(18, 18, 1);
    scene.add(sunSprite);

    // ── 10. Lighting Rig ───────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xdcf4ff, 1.8));

    const sunLight = new THREE.DirectionalLight(0xffffff, 7.5);
    sunLight.position.set(9, 14, 10);
    scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight(0x87d6eb, 3.4);
    skyFill.position.set(-8, 6, 8);
    scene.add(skyFill);

    const cyanRim = new THREE.DirectionalLight(0xe8f8ff, 8.2);
    cyanRim.position.set(-15, 12, -14);
    scene.add(cyanRim);

    const glintLight = new THREE.DirectionalLight(0xffffff, 3.8);
    glintLight.position.set(14, 3, 7);
    scene.add(glintLight);

    const groundBounce = new THREE.DirectionalLight(0x004a6b, 2.0);
    groundBounce.position.set(0, -12, 2);
    scene.add(groundBounce);

    // ── 11. Aircraft Model ────────────────────────────────────
    const planeRoot  = new THREE.Group();
    planeRoot.position.set(0, 0.1, 0);
    scene.add(planeRoot);

    const modelPivot = new THREE.Group();
    planeRoot.add(modelPivot);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const candidates = ["/plane-a340-optimized.glb", "/plane_a340.glb"];

    function loadModel(idx: number) {
      if (idx >= candidates.length) { createFallback(); return; }
      gltfLoader.load(candidates[idx], (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow    = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness        = THREE.MathUtils.clamp(mat.roughness, 0.08, 0.22);
              mat.metalness        = THREE.MathUtils.clamp(mat.metalness, 0.45, 0.78);
              mat.envMapIntensity  = 5.2;
              mat.needsUpdate      = true;
            }
          }
        });
        const box    = new THREE.Box3().setFromObject(model);
        const size   = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale  = 7.4 / Math.max(size.x, size.y, size.z);
        model.scale.set(scale, scale, scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        if (size.z > size.x && size.z > size.y) model.rotation.y = -Math.PI / 2;
        modelPivot.add(model);
        setIsLoaded(true);
        setLoadStatus("TELEMETRY STREAM ONLINE");
      }, undefined, () => loadModel(idx + 1));
    }

    function createFallback() {
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
      const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 6.8, 32), bodyMat);
      fuselage.rotation.z = Math.PI / 2;
      modelPivot.add(fuselage);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.6, roughness: 0.3 });
      const wings = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 8.5), wingMat);
      wings.position.set(-0.2, 0.1, 0);
      modelPivot.add(wings);
      setIsLoaded(true);
      setLoadStatus("PROCEDURAL TELEMETRY MESH ACTIVE");
    }

    loadModel(0);

    // ── 12. Mouse Attitude ─────────────────────────────────────
    let targetX = 0, targetY = 0;
    let targetRotX = 0.05, targetRotY = -0.35, targetRotZ = 0.04;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx   = ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
      const ny   = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX    = nx * 1.5;
      targetY    = ny * 0.8;
      targetRotX = 0.05 - ny * 0.22;
      targetRotY = -0.35 + nx * 0.35;
      targetRotZ = 0.04 - nx * 0.25;
    };
    container.addEventListener("mousemove", handleMouseMove);

    // ── 13. Animation Loop ─────────────────────────────────────
    let time = 0, animId = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time  += 0.012;

      // Aircraft idle motion
      const idleY    = Math.sin(time * 1.6)  * 0.08;
      const idleRoll = Math.cos(time * 1.3)  * 0.015;
      planeRoot.position.x += (targetX - planeRoot.position.x)         * 0.06;
      planeRoot.position.y += ((targetY + idleY) - planeRoot.position.y) * 0.06;
      planeRoot.rotation.x += (targetRotX - planeRoot.rotation.x)       * 0.07;
      planeRoot.rotation.y += (targetRotY - planeRoot.rotation.y)        * 0.07;
      planeRoot.rotation.z += ((targetRotZ + idleRoll) - planeRoot.rotation.z) * 0.07;

      // Slowly drift clouds left → loop
      cloudSprites.forEach(({ sprite, speed, baseX }) => {
        sprite.position.x -= speed;
        if (sprite.position.x < baseX - 80) sprite.position.x = baseX + 80;
      });

      // Glow ring pulse
      rings.forEach((ring, i) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = (i === 0 ? 0.35 : i === 1 ? 0.18 : 0.10)
                    * (0.7 + 0.3 * Math.sin(time * 2.4 + i));
      });

      // Star field slow rotation
      starField.rotation.y = time * 0.0012;

      renderer.render(scene, camera);
    }
    animate();

    // ── 14. Resize ────────────────────────────────────────────
    const handleResize = () => {
      width  = container.clientWidth  || 800;
      height = container.clientHeight || 450;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[rgba(0,184,217,0.3)] flex flex-col justify-between shadow-2xl"
         style={{ background: "#000d1a" }}>
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-mono"
             style={{ background: "rgba(0,13,26,0.75)", border: "1px solid rgba(0,184,217,0.3)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00B8D9" }} />
          <span className="font-bold" style={{ color: "#FFFFFF" }}>AIRBUS A340 TELEMETRY</span>
          <span style={{ color: "#526579" }}>|</span>
          <span style={{ color: "#00B8D9" }}>{loadStatus}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggle3DHero}
            className="p-1.5 rounded-lg backdrop-blur-md transition-colors"
            style={{ background: "rgba(0,13,26,0.75)", border: "1px solid rgba(0,184,217,0.3)", color: "#7B8A9A" }}
            title="Minimize 3D View"
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#00B8D9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#7B8A9A"; }}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="relative z-10 p-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pointer-events-none">
        <div className="space-y-1 font-mono text-[11px] backdrop-blur-md p-2.5 rounded-lg"
             style={{ background: "rgba(0,13,26,0.75)", border: "1px solid rgba(0,184,217,0.2)", color: "#7B8A9A" }}>
          <div className="flex items-center gap-2 font-semibold" style={{ color: "#FFFFFF" }}>
            <Compass className="w-3.5 h-3.5" style={{ color: "#00B8D9" }} />
            <span>FLIGHT ATTITUDE: MOUSE DAMPED</span>
          </div>
          <div>Active Mesh: Airbus A340 Widebody</div>
          <div>Rendering: ACES Filmic · WebGL2 · Starfield + Clouds</div>
        </div>

        <div className="font-mono text-[10px] backdrop-blur-md px-3 py-1.5 rounded-lg text-right"
             style={{ background: "rgba(0,13,26,0.75)", border: "1px solid rgba(0,184,217,0.2)", color: "#7B8A9A" }}>
          <div>LATENCY: <span className="font-bold" style={{ color: "#16C7A3" }}>4.2ms</span></div>
          <div>FRAME RATE: <span className="font-bold" style={{ color: "#00B8D9" }}>60 FPS</span></div>
        </div>
      </div>
    </div>
  );
}
