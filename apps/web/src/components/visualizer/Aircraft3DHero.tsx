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

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x003247, 0.015);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 12);
    camera.lookAt(0, 0.2, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // 2b. High-Altitude Atmospheric HDR Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext("2d");

    if (envCtx) {
      const skyGrad = envCtx.createLinearGradient(0, 0, 0, 256);
      skyGrad.addColorStop(0.00, "#001424");
      skyGrad.addColorStop(0.35, "#003752");
      skyGrad.addColorStop(0.48, "#005477");
      skyGrad.addColorStop(0.50, "#87D6EB");
      skyGrad.addColorStop(0.53, "#003a55");
      skyGrad.addColorStop(1.00, "#000e18");
      envCtx.fillStyle = skyGrad;
      envCtx.fillRect(0, 0, 512, 256);

      const sunGrad = envCtx.createRadialGradient(340, 90, 2, 340, 90, 110);
      sunGrad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
      sunGrad.addColorStop(0.2, "rgba(255, 245, 225, 0.85)");
      sunGrad.addColorStop(0.6, "rgba(135, 214, 235, 0.35)");
      sunGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
      envCtx.fillStyle = sunGrad;
      envCtx.fillRect(0, 0, 512, 256);

      const envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      envTexture.colorSpace = THREE.SRGBColorSpace;

      const envRenderTarget = pmremGenerator.fromEquirectangular(envTexture);
      scene.environment = envRenderTarget.texture;
      envTexture.dispose();
    }

    // 3. Sun Dispersion & Optical Flare
    const flareCanvas = document.createElement("canvas");
    flareCanvas.width = 256;
    flareCanvas.height = 256;
    const flareCtx = flareCanvas.getContext("2d");
    if (flareCtx) {
      const radGrad = flareCtx.createRadialGradient(128, 128, 4, 128, 128, 120);
      radGrad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
      radGrad.addColorStop(0.18, "rgba(255, 245, 210, 0.85)");
      radGrad.addColorStop(0.40, "rgba(135, 214, 235, 0.45)");
      radGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
      flareCtx.fillStyle = radGrad;
      flareCtx.fillRect(0, 0, 256, 256);
    }
    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const flareMat = new THREE.SpriteMaterial({
      map: flareTex,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
    });
    const sunSprite = new THREE.Sprite(flareMat);
    sunSprite.position.set(10.0, 13.5, -9.0);
    sunSprite.scale.set(16, 16, 1);
    scene.add(sunSprite);

    // 4. Harsh High-Contrast 6-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xdcf4ff, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 7.5);
    sunLight.position.set(9, 14, 10);
    scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight(0x87d6eb, 3.4);
    skyFill.position.set(-8, 6, 8);
    scene.add(skyFill);

    const cyanRimLight = new THREE.DirectionalLight(0xe8f8ff, 8.2);
    cyanRimLight.position.set(-15, 12, -14);
    scene.add(cyanRimLight);

    const glintLight = new THREE.DirectionalLight(0xffffff, 3.8);
    glintLight.position.set(14, 3, 7);
    scene.add(glintLight);

    const groundBounce = new THREE.DirectionalLight(0x004a6b, 2.0);
    groundBounce.position.set(0, -12, 2);
    scene.add(groundBounce);

    // 5. Roots and Pivots
    const planeRoot = new THREE.Group();
    planeRoot.position.set(0, 0.1, 0);
    scene.add(planeRoot);

    const modelPivot = new THREE.Group();
    planeRoot.add(modelPivot);

    // 6. Load GLB Model with fallback
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const candidates = ["/plane-a340-optimized.glb", "/plane_a340.glb"];

    function loadModel(idx: number) {
      if (idx >= candidates.length) {
        createProceduralFallback();
        return;
      }

      gltfLoader.load(
        candidates[idx],
        (gltf) => {
          const model = gltf.scene;

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.roughness = THREE.MathUtils.clamp(mat.roughness, 0.08, 0.22);
                mat.metalness = THREE.MathUtils.clamp(mat.metalness, 0.45, 0.78);
                mat.envMapIntensity = 5.2;
                mat.needsUpdate = true;
              }
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 7.4 / maxDim;

          model.scale.set(scale, scale, scale);
          model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
          if (size.z > size.x && size.z > size.y) {
            model.rotation.y = -Math.PI / 2;
          }

          modelPivot.add(model);
          setIsLoaded(true);
          setLoadStatus("TELEMETRY STREAM ONLINE");
        },
        undefined,
        () => {
          loadModel(idx + 1);
        }
      );
    }

    function createProceduralFallback() {
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
      });

      const bodyGeo = new THREE.CylinderGeometry(0.55, 0.45, 6.8, 32);
      const fuselage = new THREE.Mesh(bodyGeo, bodyMat);
      fuselage.rotation.z = Math.PI / 2;
      modelPivot.add(fuselage);

      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        metalness: 0.6,
        roughness: 0.3,
      });
      const wingGeo = new THREE.BoxGeometry(1.6, 0.08, 8.5);
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(-0.2, 0.1, 0);
      modelPivot.add(wings);

      setIsLoaded(true);
      setLoadStatus("PROCEDURAL TELEMETRY MESH ACTIVE");
    }

    loadModel(0);

    // 6. Interactive Mouse Flight Attitude
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let targetRotX = 0.05;
    let targetRotY = -0.35;
    let targetRotZ = 0.04;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseX = nx;
      mouseY = ny;

      targetX = nx * 1.5;
      targetY = ny * 0.8;
      targetRotX = 0.05 - ny * 0.22;
      targetRotY = -0.35 + nx * 0.35;
      targetRotZ = 0.04 - nx * 0.25;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // 7. Animation Loop
    let time = 0;
    let animId = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.012;

      const idleY = Math.sin(time * 1.6) * 0.08;
      const idleRoll = Math.cos(time * 1.3) * 0.015;

      planeRoot.position.x += (targetX - planeRoot.position.x) * 0.06;
      planeRoot.position.y += ((targetY + idleY) - planeRoot.position.y) * 0.06;
      planeRoot.rotation.x += (targetRotX - planeRoot.rotation.x) * 0.07;
      planeRoot.rotation.y += (targetRotY - planeRoot.rotation.y) * 0.07;
      planeRoot.rotation.z += ((targetRotZ + idleRoll) - planeRoot.rotation.z) * 0.07;

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      width = container.clientWidth || 800;
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden glass-panel border border-[rgba(135,214,235,0.25)] flex flex-col justify-between shadow-2xl">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Telemetry Overlay */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#002636]/80 backdrop-blur-md border border-[rgba(135,214,235,0.25)] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#87D6EB] animate-pulse"></span>
          <span className="text-white font-bold">AIRBUS A340 TELEMETRY</span>
          <span className="text-slate-400">|</span>
          <span className="text-[#87D6EB]">{loadStatus}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggle3DHero}
            className="p-1.5 rounded bg-[#002636]/80 backdrop-blur-md border border-[rgba(135,214,235,0.25)] text-slate-300 hover:text-white hover:border-[#87D6EB] transition-colors"
            title="Minimize 3D View"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom HUD Controls */}
      <div className="relative z-10 p-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pointer-events-none">
        <div className="space-y-1 font-mono text-[11px] text-slate-400 bg-[#002636]/80 backdrop-blur-md p-2.5 rounded border border-[rgba(135,214,235,0.2)]">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#87D6EB]" />
            <span>FLIGHT ATTITUDE: MOUSE DAMPED</span>
          </div>
          <div>Active Mesh: Airbus A340 Widebody</div>
          <div>Rendering: ACES Filmic Tone-mapped WebGL2</div>
        </div>

        <div className="font-mono text-[10px] text-slate-400 text-right bg-[#002636]/80 backdrop-blur-md px-3 py-1.5 rounded border border-[rgba(135,214,235,0.2)]">
          <div>LATENCY: <span className="text-emerald-400 font-bold">4.2ms</span></div>
          <div>FRAME RATE: <span className="text-[#87D6EB] font-bold">60 FPS</span></div>
        </div>
      </div>
    </div>
  );
}
