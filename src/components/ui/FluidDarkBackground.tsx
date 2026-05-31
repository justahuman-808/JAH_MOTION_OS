"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.25;

    float mouseDist = length(uv - uMouse);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist);
    vec2 mouseOffset = (uv - uMouse) * mouseInfluence * 0.12;
    vec2 displacedUv = uv + mouseOffset;

    vec2 warpedUv = displacedUv;
    warpedUv.x += sin(displacedUv.y * 2.2 + t) * 0.25;
    warpedUv.y += cos(displacedUv.x * 1.8 - t * 0.8) * 0.2;

    float fluidPattern = sin(warpedUv.x * 3.0 - warpedUv.y * 1.5 + t * 0.5);
    fluidPattern += cos(warpedUv.y * 3.5 + warpedUv.x * 2.0 - t * 0.4) * 0.5;

    float pCenter = (displacedUv.x - displacedUv.y * 0.8) + fluidPattern * 0.28;
    float pLeft = displacedUv.x + (sin(displacedUv.y * 2.8 + t * 0.6) * 0.22);

    vec3 darkBg = vec3(0.004, 0.004, 0.016);
    vec3 royalBlue = vec3(0.031, 0.114, 0.631);
    vec3 neonCyan = vec3(0.000, 0.784, 1.000);
    vec3 hotPink = vec3(0.961, 0.424, 0.694);
    vec3 brightGold = vec3(1.000, 0.788, 0.388);

    vec3 finalColor = darkBg;
    float centerBeamDist = abs(pCenter - 0.25);

    float goldCore = smoothstep(0.06, 0.00, centerBeamDist);
    float pinkEdge = smoothstep(0.15, 0.04, centerBeamDist);
    float cyanGlow = smoothstep(0.40, 0.10, centerBeamDist);

    finalColor = mix(finalColor, royalBlue, cyanGlow * 0.4);
    finalColor = mix(finalColor, neonCyan, cyanGlow);
    finalColor = mix(finalColor, hotPink, pinkEdge);
    finalColor = mix(finalColor, hotPink, smoothstep(0.0, 0.15, pCenter - 0.25) * pinkEdge * 0.35);
    finalColor = mix(finalColor, brightGold, goldCore);

    float cloudMask = smoothstep(0.30, -0.20, pLeft);
    float cloudPink = smoothstep(0.10, -0.30, pLeft);
    float cloudGold = smoothstep(-0.05, -0.50, pLeft);

    vec3 leftCloudColor = mix(neonCyan, hotPink, cloudPink);
    leftCloudColor = mix(leftCloudColor, brightGold, cloudGold);
    finalColor = mix(finalColor, leftCloudColor, cloudMask);
    finalColor += royalBlue * smoothstep(0.35, 1.0, displacedUv.x) * 0.25;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function FluidDarkBackground() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme !== "dark") {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    const mouseTarget = new THREE.Vector2(0.5, 0.5);
    const mouseCurrent = new THREE.Vector2(0.5, 0.5);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frameId = 0;

    scene.add(mesh);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseTarget.x = (event.clientX - rect.left) / rect.width;
      mouseTarget.y = 1 - (event.clientY - rect.top) / rect.height;
    };

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const tick = () => {
      uniforms.uTime.value = (performance.now() - start) / 1000;
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.06;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.06;
      uniforms.uMouse.value.copy(mouseCurrent);
      renderer.render(scene, camera);

      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [theme]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#010205] opacity-0 transition-opacity duration-500 dark:opacity-100"
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div
        className="absolute inset-0 h-full w-full opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  );
}
