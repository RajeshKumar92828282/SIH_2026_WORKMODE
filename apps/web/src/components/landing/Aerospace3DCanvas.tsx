"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Compass, Zap, Activity, Eye, RefreshCw, Layers } from "lucide-react";

export function Aerospace3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframeMode, setWireframeMode] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [activeRoute, setActiveRoute] = useState("DEL-BOM");

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x00121e, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 22);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 4. Group for Aircraft + Particles + Grid
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- A. Supersonic Aircraft Geometry (High Tech Jet Fighter Shape) ---
    const jetGroup = new THREE.Group();

    // Fuselage
    const noseGeo = new THREE.ConeGeometry(0.8, 4, 16);
    noseGeo.rotateX(Math.PI / 2);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x87d6eb,
      wireframe: true,
      emissive: 0x003247,
      metalness: 0.8,
      roughness: 0.2
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = 2;
    jetGroup.add(nose);

    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.7, 5, 16);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0088cc,
      wireframe: true,
      emissive: 0x001826,
      metalness: 0.9,
      roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.z = -1.5;
    jetGroup.add(body);

    // Delta Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(4.5, -3);
    wingShape.lineTo(0.8, -3.5);
    wingShape.lineTo(0, 0);

    const wingExtrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
    wingGeo.rotateX(Math.PI / 2);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      wireframe: true,
      emissive: 0x004466,
      side: THREE.DoubleSide
    });

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.4, 0, 0.5);
    jetGroup.add(rightWing);

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.scale.set(-1, 1, 1);
    leftWing.position.set(-0.4, 0, 0.5);
    jetGroup.add(leftWing);

    // Twin Vertical Stabilizers (F-22 Raptor Style)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(1.2, 2.2);
    finShape.lineTo(0.3, 2.2);
    finShape.lineTo(-0.4, 0);
    finShape.lineTo(0, 0);

    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: false });
    const finMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      wireframe: true,
      emissive: 0x550022
    });

    const rightFin = new THREE.Mesh(finGeo, finMat);
    rightFin.position.set(0.6, 0.5, -3.5);
    rightFin.rotation.z = -0.25;
    jetGroup.add(rightFin);

    const leftFin = new THREE.Mesh(finGeo, finMat);
    leftFin.position.set(-0.6, 0.5, -3.5);
    leftFin.rotation.z = 0.25;
    jetGroup.add(leftFin);

    // Jet Engine Thruster Rings (Neon Glowing Cylinders)
    const ringGeo = new THREE.TorusGeometry(0.4, 0.08, 16, 32);
    const ringMatRight = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const ringMatLeft = new THREE.MeshBasicMaterial({ color: 0xff00ff });

    const rightEngineRing = new THREE.Mesh(ringGeo, ringMatRight);
    rightEngineRing.position.set(0.45, 0, -4);
    jetGroup.add(rightEngineRing);

    const leftEngineRing = new THREE.Mesh(ringGeo, ringMatLeft);
    leftEngineRing.position.set(-0.45, 0, -4);
    jetGroup.add(leftEngineRing);

    mainGroup.add(jetGroup);

    // --- B. Glowing Particle Engine Plumes (GSAP animated colorful thruster streams) ---
    const particleCount = 250;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00ffff);
    const color2 = new THREE.Color(0xff00aa);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 2] = -4 - Math.random() * 12;

      const mixRatio = Math.random();
      const pColor = color1.clone().lerp(color2, mixRatio);
      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    jetGroup.add(particles);

    // --- C. Orbital Aeronautical Radar Ring & Holographic Grid ---
    const radarGeo = new THREE.RingGeometry(8, 8.15, 64);
    const radarMat = new THREE.MeshBasicMaterial({ color: 0x87d6eb, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const radarRing = new THREE.Mesh(radarGeo, radarMat);
    radarRing.rotation.x = Math.PI / 2;
    radarRing.position.y = -3;
    mainGroup.add(radarRing);

    const gridHelper = new THREE.GridHelper(30, 30, 0x00f3ff, 0x002636);
    gridHelper.position.y = -4;
    mainGroup.add(gridHelper);

    // --- D. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f3ff, 1.5);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff00ff, 1.2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // --- E. GSAP Animations & Timelines ---
    // Smooth idle hovering flight banking (roll, pitch, yaw)
    const gsapHoverTL = gsap.timeline({ repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsapHoverTL.to(jetGroup.position, { y: 0.6, duration: 2.5 })
               .to(jetGroup.rotation, { z: 0.08, x: -0.05, duration: 2.5 }, 0);

    // Continuous rotation of main group
    gsap.to(mainGroup.rotation, {
      y: Math.PI * 2,
      duration: 24,
      repeat: -1,
      ease: "none"
    });

    // Radar pulse animation
    gsap.to(radarRing.scale, {
      x: 1.3,
      y: 1.3,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    // Mouse Interaction Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / rect.width - 0.5) * 2;
      mouseY = -(y / rect.height - 0.5) * 2;

      gsap.to(jetGroup.rotation, {
        y: mouseX * 0.4,
        x: mouseY * 0.3,
        duration: 0.8,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // --- F. Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate thruster particles speed & position back reset
      const pPos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pPos[i * 3 + 2] -= 0.35 * speedMultiplier;
        if (pPos[i * 3 + 2] < -16) {
          pPos[i * 3 + 2] = -4;
          pPos[i * 3] = (Math.random() - 0.5) * 1.5;
          pPos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Pulse engine thruster ring colors
      ringMatRight.color.setHSL((elapsedTime * 0.2) % 1, 1, 0.5);
      ringMatLeft.color.setHSL((elapsedTime * 0.2 + 0.5) % 1, 1, 0.5);

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [speedMultiplier]);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-3xl overflow-hidden glass-panel border border-[rgba(135,214,235,0.3)] shadow-[0_0_50px_rgba(0,180,255,0.15)] bg-gradient-to-b from-[#001826] via-[#002636] to-[#000f19]">
      {/* 3D WebGL Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Cockpit Aerospace HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none font-mono text-xs">
        <div className="flex items-center gap-3 bg-[#001826]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-cyan-400 pointer-events-auto">
          <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
          <span className="font-bold tracking-wider">AEROSPACE CFD ENGINE</span>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-500/40">
            3D REALTIME
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 bg-[#001826]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 text-slate-300 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">CORRIDOR:</span>
            <span className="text-cyan-400 font-bold">{activeRoute}</span>
          </div>
          <div className="w-px h-4 bg-cyan-500/30"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">ALTITUDE:</span>
            <span className="text-emerald-400 font-bold">36,000 FT</span>
          </div>
          <div className="w-px h-4 bg-cyan-500/30"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">THRUST VECTORS:</span>
            <span className="text-purple-400 font-bold">ACTIVE (GSAP)</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Overlay at Bottom */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto font-mono text-xs">
        <div className="flex items-center gap-2 bg-[#001826]/90 backdrop-blur-md p-1.5 rounded-2xl border border-cyan-500/30">
          {["DEL-BOM", "BLR-DEL", "CCU-BOM", "MAA-DEL"].map((route) => (
            <button
              key={route}
              onClick={() => setActiveRoute(route)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeRoute === route
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-cyan-500/10"
              }`}
            >
              {route}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-[#001826]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-cyan-500/30">
          <span className="text-slate-400 text-[11px]">THRUST SPEED:</span>
          {[1, 1.8, 2.5].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeedMultiplier(spd)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                speedMultiplier === spd
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
