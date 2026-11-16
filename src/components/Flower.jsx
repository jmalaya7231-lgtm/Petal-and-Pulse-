import { useId } from "react";

// A soft five-petal flower, matching the logo
export function Flower({ size = 80, tone = "soft" }) {
  const gid = `fl${useId().replace(/:/g, "")}`;
  const [inner, outer] = tone === "rose" ? ["#F4A7C3", "#E879A9"] : ["#FCE7F0", "#F8BBD0"];

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor={inner} />
          <stop offset="100%" stopColor={outer} />
        </radialGradient>
      </defs>
      <g fill={`url(#${gid})`}>
        <ellipse cx="24" cy="12" rx="7" ry="10" />
        <ellipse cx="24" cy="12" rx="7" ry="10" transform="rotate(72 24 24)" />
        <ellipse cx="24" cy="12" rx="7" ry="10" transform="rotate(144 24 24)" />
        <ellipse cx="24" cy="12" rx="7" ry="10" transform="rotate(216 24 24)" />
        <ellipse cx="24" cy="12" rx="7" ry="10" transform="rotate(288 24 24)" />
      </g>
      <circle cx="24" cy="24" r="4.5" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}

// A small curved stem with leaves
export function Sprig({ size = 120 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 95 C 30 62, 55 40, 88 14"
        fill="none"
        stroke="#E879A9"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <g fill="#F8BBD0">
        <ellipse cx="28" cy="70" rx="10" ry="4.5" transform="rotate(-48 28 70)" />
        <ellipse cx="44" cy="55" rx="10" ry="4.5" transform="rotate(20 44 55)" />
        <ellipse cx="58" cy="42" rx="9" ry="4" transform="rotate(-52 58 42)" />
        <ellipse cx="72" cy="28" rx="8" ry="3.6" transform="rotate(16 72 28)" />
      </g>
      <circle cx="88" cy="14" r="4" fill="#E879A9" opacity="0.7" />
    </svg>
  );
}
