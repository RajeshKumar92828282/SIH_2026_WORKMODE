"use client";

import React, { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;
    if (!dot || !outline) return;

    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseLeave = () => {
      dot.style.opacity = "0";
      outline.style.opacity = "0";
    };

    const onMouseEnter = () => {
      dot.style.opacity = "1";
      outline.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    const addHoverListeners = () => {
      const targets = document.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [role="button"], .cursor-pointer, .chart-bar-hover'
      );
      targets.forEach((el) => {
        el.addEventListener("mouseenter", () => outline.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => outline.classList.remove("cursor-hover"));
      });
    };
    addHoverListeners();

    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    const render = () => {
      dotX += (mouseX - dotX) * 0.75;
      dotY += (mouseY - dotY) * 0.75;
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      outline.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

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
    <>
      <div id="custom-cursor-dot" ref={dotRef} />
      <div id="custom-cursor-outline" ref={outlineRef} />
    </>
  );
}
