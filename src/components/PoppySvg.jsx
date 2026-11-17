import { useId } from "react";

const LINE = "#E8D5DC";
const ROSE = "#E879A9";

// Which face goes with which mood
const FACES = {
  idle: { eyes: "open", mouth: "smile" },
  wave: { eyes: "open", mouth: "open" },
  happy: { eyes: "happy", mouth: "open" },
  think: { eyes: "look", mouth: "o" },
  remind: { eyes: "open", mouth: "smile" },
  sleep: { eyes: "closed", mouth: "smile" },
  load: { eyes: "look", mouth: "smile" },
};

function Pupil({ cx, big }) {
  return (
    <g>
      <ellipse cx={cx} cy="57" rx={big ? 4.7 : 4.4} ry={big ? 5.9 : 5.4} fill="#49343D" />
      <circle cx={cx + 1.5} cy="54.8" r="1.7" fill="#fff" />
      <circle cx={cx - 1.3} cy="59.4" r="0.8" fill="#fff" opacity="0.8" />
    </g>
  );
}

function Eyes({ kind }) {
  if (kind === "happy") {
    return (
      <g fill="none" stroke="#49343D" strokeWidth="2.4" strokeLinecap="round">
        <path d="M44 59 Q49 52 54 59" />
        <path d="M66 59 Q71 52 76 59" />
      </g>
    );
  }
  if (kind === "closed") {
    return (
      <g fill="none" stroke="#49343D" strokeWidth="2.2" strokeLinecap="round">
        <path d="M44 56 Q49 62 54 56" />
        <path d="M66 56 Q71 62 76 56" />
      </g>
    );
  }
  if (kind === "look") {
    return (
      <>
        <g transform="translate(1.6 -1.8)">
          <g className="pp-eyes">
            <Pupil cx={49} big />
            <Pupil cx={71} big />
          </g>
        </g>
        <path
          d="M66 46.5 Q71 43 76 46"
          fill="none"
          stroke="#D9B8C6"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    );
  }
  return (
    <g className="pp-eyes">
      <Pupil cx={49} />
      <Pupil cx={71} />
    </g>
  );
}

function Mouth({ kind }) {
  if (kind === "open") {
    return (
      <g>
        <path d="M54 68 Q60 80 66 68 Z" fill="#C44578" />
        <ellipse cx="60" cy="74.6" rx="3.2" ry="2" fill="#F4A7C3" />
      </g>
    );
  }
  if (kind === "o") {
    return <ellipse cx="60" cy="72" rx="2.6" ry="3.2" fill="#C44578" />;
  }
  return (
    <g>
      <rect x="58.3" y="69.6" width="3.4" height="4.2" rx="1.1" fill="#fff" stroke={LINE} strokeWidth="0.7" />
      <path
        d="M55.5 68.2 Q57.8 71.4 60 68.2 Q62.2 71.4 64.5 68.2"
        fill="none"
        stroke="#C44578"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

export default function PoppySvg({ mood = "idle", viewBox = "0 0 120 150" }) {
  const uid = useId().replace(/:/g, "");
  const face = FACES[mood] || FACES.idle;
  const fur = `url(#${uid}-fur)`;
  const suit = `url(#${uid}-suit)`;

  return (
    <svg className="pp" data-mood={mood} viewBox={viewBox} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-fur`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFEFB" />
          <stop offset="1" stopColor="#FBEBDD" />
        </linearGradient>
        <linearGradient id={`${uid}-suit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCD3E2" />
          <stop offset="1" stopColor="#F4A7C3" />
        </linearGradient>
      </defs>

      <ellipse className="pp-shadow" cx="60" cy="146" rx="30" ry="4" fill="rgba(196,69,120,0.18)" />

      {/* tail and feet */}
      <circle cx="90" cy="131" r="7" fill={fur} stroke={LINE} strokeWidth="1.2" />
      <ellipse cx="46" cy="139" rx="11.5" ry="5.8" fill={fur} stroke={LINE} strokeWidth="1.2" />
      <ellipse cx="74" cy="139" rx="11.5" ry="5.8" fill={fur} stroke={LINE} strokeWidth="1.2" />

      {/* pink uniform, collar, cross, pocket and stethoscope */}
      <g className="pp-torso">
        <path
          d="M36 92 C36 84 84 84 84 92 L90 131 C90 139 30 139 30 131 Z"
          fill={suit}
          stroke={ROSE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M32 126 Q60 132 88 126" fill="none" stroke={ROSE} strokeWidth="1" opacity="0.45" />
        <path
          d="M49 87 L60 102 L71 87 Q60 91.500 49 87 Z"
          fill="#fff"
          stroke="#F0C7D8"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <path d="M44 106.500 v8 M40 110.500 h8" stroke="#fff" strokeWidth="2.600" strokeLinecap="round" />
        <rect x="67" y="113" width="13" height="11" rx="3" fill="#fff" opacity="0.95" />
        <rect x="71.500" y="107.500" width="2.400" height="7" rx="1.200" fill="#C44578" />
        <path
          d="M47 82 C43 106 52 119 60 119 C68 119 77 106 73 82"
          fill="none"
          stroke="#7A6670"
          strokeWidth="2.400"
          strokeLinecap="round"
        />
        <circle cx="60" cy="122" r="4.200" fill="#EFE7EB" stroke="#7A6670" strokeWidth="1.600" />
        <circle cx="60" cy="122" r="1.400" fill="#7A6670" opacity="0.5" />
      </g>

      {/* head */}
      <g className="pp-head">
        <g transform="rotate(-9 46 44)">
          <g className="pp-ear pp-ear-l">
            <ellipse cx="46" cy="24" rx="8.800" ry="21" fill={fur} stroke={LINE} strokeWidth="1.200" />
            <ellipse cx="46" cy="26" rx="4.600" ry="14" fill="#F8BBD0" />
          </g>
        </g>
        <g transform="rotate(9 74 44)">
          <g className="pp-ear pp-ear-r">
            <ellipse cx="74" cy="24" rx="8.800" ry="21" fill={fur} stroke={LINE} strokeWidth="1.200" />
            <ellipse cx="74" cy="26" rx="4.600" ry="14" fill="#F8BBD0" />
          </g>
        </g>

        <ellipse cx="60" cy="60" rx="30" ry="26" fill={fur} stroke={LINE} strokeWidth="1.400" />

        {/* pink flower */}
        <g transform="translate(35.800 34.800) scale(0.3)">
          <g fill={ROSE}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="24" cy="12" rx="7" ry="10" transform={`rotate(${r} 24 24)`} />
            ))}
          </g>
          <circle cx="24" cy="24" r="6" fill="#FFF0A8" />
        </g>

        <ellipse cx="42" cy="68" rx="6" ry="3.800" fill="#F8BBD0" opacity="0.75" />
        <ellipse cx="78" cy="68" rx="6" ry="3.800" fill="#F8BBD0" opacity="0.75" />

        <g fill="none" stroke="#E3CFD8" strokeWidth="1" strokeLinecap="round">
          <path d="M41 65 L28 62.500" />
          <path d="M41 68.500 L28 69.500" />
          <path d="M79 65 L92 62.500" />
          <path d="M79 68.500 L92 69.500" />
        </g>

        <Eyes kind={face.eyes} />
        <ellipse cx="60" cy="64.500" rx="3.200" ry="2.300" fill={ROSE} />
        <Mouth kind={face.mouth} />
      </g>

      {/* paws, drawn last so a raised paw shows in front */}
      <g className="pp-arm pp-arm-l">
        <ellipse
          cx="32"
          cy="109"
          rx="6.500"
          ry="13"
          transform="rotate(14 32 109)"
          fill="#F6B5CD"
          stroke={ROSE}
          strokeWidth="1"
        />
        <circle cx="29" cy="122" r="5.500" fill={fur} stroke={LINE} strokeWidth="1.100" />
      </g>
      <g className="pp-arm pp-arm-r">
        <ellipse
          cx="88"
          cy="109"
          rx="6.500"
          ry="13"
          transform="rotate(-14 88 109)"
          fill="#F6B5CD"
          stroke={ROSE}
          strokeWidth="1"
        />
        <circle cx="91" cy="122" r="5.500" fill={fur} stroke={LINE} strokeWidth="1.100" />
      </g>

      {mood === "sleep" && (
        <g>
          <text x="88" y="40" className="pp-z z1" fontSize="13">z</text>
          <text x="97" y="27" className="pp-z z2" fontSize="10">z</text>
          <text x="104" y="16" className="pp-z z3" fontSize="8">z</text>
        </g>
      )}
    </svg>
  );
}
