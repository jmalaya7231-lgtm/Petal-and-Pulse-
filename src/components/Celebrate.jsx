import { useEffect, useRef, useState } from "react";

const COLORS = ["#F8BBD0", "#F4A7C3", "#E879A9", "#FCE7F0", "#C44578"];
const rand = (min, max) => min + Math.random() * (max - min);

// A short burst of petals. It removes itself when it's done, and doesn't play
// at all when the device has "reduce motion" turned on.
export default function Celebrate({ onDone, count = 28 }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [bits] = useState(() =>
    Array.from({ length: count }, (_, id) => ({
      id,
      size: rand(10, 20),
      dx: rand(-46, 46),
      rise: rand(12, 30),
      fall: rand(45, 80),
      rot: rand(-540, 540),
      delay: rand(0, 0.35),
      dur: rand(1.5, 2.3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  );

  useEffect(() => {
    const id = setTimeout(() => doneRef.current && doneRef.current(), reduce ? 0 : 2900);
    return () => clearTimeout(id);
  }, [reduce]);

  if (reduce) return null;

  return (
    <div className="celebrate" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className="confetti-petal"
          style={{
            "--dx": `${b.dx}vw`,
            "--rise": `${b.rise}vh`,
            "--fall": `${b.fall}vh`,
            "--rot": `${b.rot}deg`,
            "--d": `${b.delay}s`,
            "--t": `${b.dur}s`,
            width: b.size,
            height: b.size * 1.25,
            background: b.color,
          }}
        />
      ))}
    </div>
  );
}
