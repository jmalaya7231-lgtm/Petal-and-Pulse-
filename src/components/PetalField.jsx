import { useEffect, useRef } from "react";

const COLORS = ["#F8BBD0", "#F4A7C3", "#FCE7F0", "#E879A9", "#F9C9DB"];

const rand = (min, max) => min + Math.random() * (max - min);

// "depth" makes bigger petals fall faster and look stronger, like they're closer
function makePetal(w, h, scatter) {
  const depth = Math.random();
  return {
    x: rand(0, w),
    y: scatter ? rand(0, h) : rand(-60, -10),
    size: 7 + depth * 9,
    speed: 0.35 + depth * 0.75,
    drift: rand(-0.12, 0.25),
    sway: rand(0.4, 1.3),
    swayPhase: rand(0, Math.PI * 2),
    swaySpeed: rand(0.008, 0.02),
    rot: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.02, 0.02),
    flip: rand(0, Math.PI * 2),
    flipSpeed: rand(0.01, 0.03),
    alpha: 0.3 + depth * 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export default function PetalField({ enabled = true, calm = false }) {
  const canvasRef = useRef(null);
  const calmRef = useRef(calm);
  calmRef.current = calm;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect the device's "reduce motion" setting: no petals at all
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    let w = 0;
    let h = 0;
    let petals = [];
    let raf = 0;
    let last = 0;
    let running = false;
    let resizeTimer = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(34, Math.max(12, Math.round((w * h) / 52000)));
      while (petals.length < target) petals.push(makePetal(w, h, true));
      petals.length = target;
    }

    function drawPetal(p, alphaScale) {
      const s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(0.45 + 0.55 * Math.abs(Math.cos(p.flip)), 1); // a slow tumble
      ctx.globalAlpha = p.alpha * alphaScale;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.75, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.75, s * 0.6, -s * 0.95, -s * 0.55, 0, -s);
      ctx.fill();
      ctx.restore();
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(3, (now - (last || now)) / 16.667); // keeps speed steady on any screen
      last = now;

      const calmNow = calmRef.current;
      const count = calmNow ? Math.ceil(petals.length * 0.5) : petals.length;
      const alphaScale = calmNow ? 0.5 : 1;

      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < count; i++) {
        const p = petals[i];
        p.swayPhase += p.swaySpeed * dt;
        p.x += (p.drift + Math.sin(p.swayPhase) * p.sway) * dt;
        p.y += p.speed * dt;
        p.rot += p.rotSpeed * dt;
        p.flip += p.flipSpeed * dt;

        if (p.y > h + 30 || p.x < -50 || p.x > w + 50) {
          petals[i] = makePetal(w, h, false);
        }
        drawPetal(petals[i], alphaScale);
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // Save battery: stop drawing when the tab isn't visible
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }

    resize();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="petal-canvas" aria-hidden="true" />;
}
