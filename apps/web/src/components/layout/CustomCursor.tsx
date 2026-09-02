"use client";

import React, { useEffect, useRef } from "react";

export function CustomCursor() {
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plane = planeRef.current;
    if (!plane) return;

    let mouseX = -200, mouseY = -200;
    let curX = -200, curY = -200;
    let isHovering = false;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseLeave = () => {
      plane.style.opacity = "0";
    };
    const onMouseEnter = () => {
      plane.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Hover: tilt the plane and add a trail glow
    const addHoverListeners = () => {
      const targets = document.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [role="button"], .cursor-pointer'
      );
      targets.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          isHovering = true;
          plane.classList.add("plane-hover");
        });
        el.addEventListener("mouseleave", () => {
          isHovering = false;
          plane.classList.remove("plane-hover");
        });
      });
    };
    addHoverListeners();

    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    // Smooth lag follow
    const render = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;

      plane.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%) ${
        isHovering ? "rotate(-20deg) scale(1.35)" : "rotate(-35deg) scale(1)"
      }`;

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <div id="apix-plane-cursor" ref={planeRef}>
      {/* Airplane SVG icon */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
      >
        {/* Shadow / glow layer */}
        <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(37,99,235,0.18)" />
        {/* Fuselage */}
        <path
          d="M32 6 C34 6 40 16 40 28 L40 42 C40 44 36 46 32 46 C28 46 24 44 24 42 L24 28 C24 16 30 6 32 6Z"
          fill="url(#planeBody)"
        />
        {/* Wings */}
        <path
          d="M24 30 L6 38 L10 42 L24 36Z"
          fill="url(#wingL)"
        />
        <path
          d="M40 30 L58 38 L54 42 L40 36Z"
          fill="url(#wingR)"
        />
        {/* Tail fins */}
        <path d="M28 40 L18 50 L24 50 L32 44Z" fill="#93c5fd" />
        <path d="M36 40 L46 50 L40 50 L32 44Z" fill="#93c5fd" />
        {/* Cockpit window */}
        <ellipse cx="32" cy="18" rx="4" ry="6" fill="#bfdbfe" opacity="0.85" />
        {/* Engine pods */}
        <rect x="16" y="34" width="6" height="10" rx="3" fill="#1d4ed8" />
        <rect x="42" y="34" width="6" height="10" rx="3" fill="#1d4ed8" />
        {/* Engine glow */}
        <ellipse cx="19" cy="44" rx="3" ry="2" fill="#f97316" opacity="0.7" />
        <ellipse cx="45" cy="44" rx="3" ry="2" fill="#f97316" opacity="0.7" />

        <defs>
          <linearGradient id="planeBody" x1="32" y1="6" x2="32" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="wingL" x1="6" y1="38" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="wingR" x1="58" y1="38" x2="40" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
