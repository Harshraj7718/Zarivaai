"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

// A slow, flowing field: domain-warped fbm noise in the brand greens, with lime glints
// that gather near the pointer and a faint dot grid on top.
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uBase;
  uniform vec3 uDeep;
  uniform vec3 uLime;
  uniform vec3 uOrange;

  vec2 hash(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash(i), f), dot(hash(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
               mix(dot(hash(i + vec2(0, 1)), f - vec2(0, 1)), dot(hash(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.2;
    float t = uTime * 0.06;
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t));
    float f = fbm(p + 3.0 * r);

    vec3 col = mix(uBase, uDeep, smoothstep(-0.2, 0.6, f) * 0.55);
    // lime glints that pool near the pointer
    vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.2;
    float near = exp(-dot(p - m, p - m) * 1.6);
    float glint = smoothstep(0.32, 0.62, f + length(q) * 0.25) * (0.35 + near * 0.9);
    col = mix(col, uLime, glint * 0.38);
    col = mix(col, uOrange, smoothstep(0.62, 0.9, f) * 0.18 * near);

    // faint dot grid
    vec2 g = fract(uv * uRes / 22.0) - 0.5;
    col = mix(col, uDeep, (1.0 - smoothstep(0.03, 0.09, length(g))) * 0.18);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const hex = (v: string, fallback: string) => new THREE.Color((v || fallback).trim());

/** WebGL background for the hero diagram panel. Pauses off-screen; a single still frame with reduced motion. */
export default function HeroShader() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the CSS background underneath still shows
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uBase: { value: new THREE.Color() },
      uDeep: { value: new THREE.Color() },
      uLime: { value: new THREE.Color("#79D900") },
      uOrange: { value: new THREE.Color("#FF9100") },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const dark = cs.colorScheme === "dark";
      uniforms.uBase.value.copy(hex(cs.getPropertyValue("--hero-tint"), dark ? "#081a08" : "#e9eedb"));
      uniforms.uDeep.value.copy(dark ? new THREE.Color("#0f3a0f") : new THREE.Color("#c9dcae"));
      draw();
    };
    const size = () => {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      uniforms.uRes.value.set(r.width, r.height);
      draw();
    };
    const draw = () => renderer.render(scene, camera);

    const target = new THREE.Vector2(0.5, 0.5);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true, raf = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    const themeObs = new MutationObserver(readTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", readTheme);

    readTheme();
    size();
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      uniforms.uTime.value = (now - start) / 1000;
      uniforms.uMouse.value.lerp(target, 0.05);
      draw();
    };
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); themeObs.disconnect();
      mq.removeEventListener("change", readTheme);
      window.removeEventListener("pointermove", onMove);
      mesh.geometry.dispose(); material.dispose(); renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
