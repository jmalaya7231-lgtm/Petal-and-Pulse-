import { useEffect, useState } from "react";

// Counts from 0 up to a real number. With "reduce motion" on, it just shows the number.
export default function CountUp({ value, duration = 900 }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !value) {
      setN(value || 0);
      return;
    }

    let raf = 0;
    let start = 0;
    function tick(now) {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{n.toLocaleString()}</>;
}
