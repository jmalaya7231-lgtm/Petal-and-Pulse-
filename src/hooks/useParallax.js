import { useEffect } from "react";

// Gives an element --px and --py (mouse position, -1 to 1) and --sy (scroll amount).
// Decorations read these to drift slightly. Off when "reduce motion" is on.
export default function useParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let px = 0;
    let py = 0;
    let sy = 0;

    function apply() {
      raf = 0;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
      el.style.setProperty("--sy", sy.toFixed(1));
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(apply);
    }

    function onMove(e) {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      schedule();
    }
    function onLeave() {
      px = 0;
      py = 0;
      schedule();
    }
    function onScroll() {
      sy = Math.min(window.scrollY, 600);
      schedule();
    }

    onScroll();
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ref]);
}
