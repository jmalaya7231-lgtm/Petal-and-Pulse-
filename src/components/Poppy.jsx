import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Minus, Sparkles } from "lucide-react";
import PoppySvg from "./PoppySvg.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { useTimer } from "../context/TimerContext.jsx";
import { counts, facts, lastAttempt } from "../lib/poppyData.js";
import * as M from "../data/poppyMessages.js";

const IDLE_MS = 90 * 1000; // she falls asleep after this much inactivity
const MAX_NUDGES = 4; // at most this many unprompted messages per visit
const WATCHED = new Set([
  "pp:tasks",
  "pp:checklist",
  "pp:quizAttempts",
  "pp:flashcardLog",
  "pp:sessions",
]);
const MOOD_MS = { wave: 2300, happy: 2600, think: 800, remind: 2800 };

// Picks a message that wasn't used recently
function choose(list, key, recent) {
  const options = list.map((m, i) => ({ ...m, id: `${key}:${i}` }));
  const fresh = options.filter((m) => !recent.current.includes(m.id));
  const pool = fresh.length ? fresh : options;
  const msg = pool[Math.floor(Math.random() * pool.length)];
  recent.current = [...recent.current, msg.id].slice(-8);
  return msg;
}

function nudgeCount() {
  try {
    return Number(sessionStorage.getItem("pp:poppyNudges")) || 0;
  } catch {
    return 0;
  }
}
function bumpNudges() {
  try {
    sessionStorage.setItem("pp:poppyNudges", String(nudgeCount() + 1));
  } catch {
    // Not important
  }
}

const HEART = "M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z";

export default function Poppy() {
  const [mode, setMode] = useLocalStorage("pp:poppyMode", "open"); // "open" or "min"
  const [mood, setMood] = useState("idle");
  const [asleep, setAsleep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [menu, setMenu] = useState(false);
  const [ping, setPing] = useState(false);
  const [fx, setFx] = useState(0);

  const { pathname } = useLocation();
  const { timer } = useTimer();
  const studying = timer.running && timer.phase === "study";
  const quietPassive =
    studying || pathname.startsWith("/quizzes") || pathname.startsWith("/library/");

  const rootRef = useRef(null);
  const timers = useRef({});
  const recent = useRef([]);
  const pending = useRef(null);
  const clicks = useRef([]);
  const lastActive = useRef(Date.now());
  const napUntil = useRef(0);
  const lastEvent = useRef(0);
  const state = useRef({});
  const api = useRef({});
  state.current = { mode, asleep, bubble, busy, studying, quietPassive };

  const later = (name, fn, ms) => {
    clearTimeout(timers.current[name]);
    timers.current[name] = setTimeout(fn, ms);
  };
  const cancel = (name) => clearTimeout(timers.current[name]);

  function hide() {
    cancel("bubble");
    setBubble((b) => (b ? { ...b, leaving: true } : b));
    later("leave", () => setBubble(null), 260);
  }

  function setMoodFor(next) {
    setMood(next);
    cancel("mood");
    const ms = MOOD_MS[next];
    if (ms) later("mood", () => setMood("idle"), ms);
  }

  // Poppy says something. If she can't speak right now, the pink dot appears instead.
  function show(msg, { force = false } = {}) {
    const s = state.current;
    if (s.mode !== "open" || (s.studying && !force)) {
      pending.current = msg;
      setPing(true);
      return;
    }
    if (s.asleep) setAsleep(false);
    cancel("leave");
    setMenu(false);
    setPing(false);
    pending.current = null;
    setBubble({ ...msg, key: Date.now() });
    setMoodFor(msg.mood || "idle");
    if (msg.fx) setFx((n) => n + 1);
    cancel("bubble");
    if (!msg.sticky) later("bubble", hide, Math.min(9000, 4200 + msg.text.length * 55));
  }

  function wake() {
    if (!state.current.asleep) return;
    cancel("nap");
    setAsleep(false);
    setMoodFor("wave");
  }

  function sleepNow() {
    cancel("mood");
    setMood("idle");
    setMenu(false);
    hide();
    setAsleep(true);
  }

  function nap() {
    show(M.breather, { force: true });
    napUntil.current = Date.now() + 5000;
    setAsleep(true);
    later(
      "nap",
      () => {
        napUntil.current = 0;
        api.current.wake();
      },
      5000
    );
  }

  function minimize() {
    ["bubble", "leave", "think", "mood", "nap"].forEach(cancel);
    setBubble(null);
    setMenu(false);
    setAsleep(false);
    setMood("idle");
    setMode("min");
  }

  function openFromMin() {
    setMode("open");
    setAsleep(false);
    lastActive.current = Date.now();
    setMoodFor("wave");
    const p = pending.current;
    if (p) {
      pending.current = null;
      setPing(false);
      later("pendingShow", () => api.current.show(p, { force: true }), 700);
    }
  }

  function pickWelcome() {
    if (Math.random() < 0.4) return M.timeGreeting(new Date().getHours());
    return choose(M.welcome, "welcome", recent);
  }

  function reminderMsg() {
    const r = M.buildReminder(facts());
    return r.real ? r : choose(M.selfcare, "selfcare", recent);
  }

  function randomMsg() {
    const roll = Math.random();
    if (roll < 0.3) return pickWelcome();
    if (roll < 0.7) return choose(M.encourage, "encourage", recent);
    return reminderMsg();
  }

  // An unprompted message: a real reminder if there is one, otherwise something kind
  function nudge() {
    const r = M.buildReminder(facts());
    if (r.real && Math.random() < 0.7) return r;
    return Math.random() < 0.5
      ? choose(M.encourage, "encourage", recent)
      : choose(M.selfcare, "selfcare", recent);
  }

  function onPoppyClick() {
    const s = state.current;
    if (s.asleep) {
      if (Date.now() >= napUntil.current) wake();
      return;
    }
    if (pending.current) {
      const p = pending.current;
      pending.current = null;
      setPing(false);
      show(p, { force: true });
      return;
    }

    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 5000), now];
    const n = clicks.current.length;
    setMenu(false);

    if (n >= 8) {
      clicks.current = [];
      cancel("think");
      nap();
      return;
    }
    if (n >= 4) {
      cancel("think");
      show(choose(M.ticklish, "tickle", recent), { force: true });
      return;
    }

    // She tilts her head for a moment, then answers
    setMoodFor("think");
    later("think", () => show(randomMsg(), { force: true }), 750);
  }

  function runMenu(kind) {
    setMenu(false);
    if (kind === "hide") return minimize();
    if (kind === "hello") return show(pickWelcome(), { force: true });
    if (kind === "motivate") {
      return show(choose(M.encourage, "encourage", recent), { force: true });
    }
    return show(reminderMsg(), { force: true });
  }

  api.current = { show, hide, wake, sleepNow, nudge, pickWelcome };

  /* ---------- Welcome, once per visit ---------- */
  useEffect(() => {
    if (mode !== "open") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("pp:poppyWelcomed") === "1";
    } catch {
      // Not important
    }
    if (seen) return;
    const id = setTimeout(() => {
      try {
        sessionStorage.setItem("pp:poppyWelcomed", "1");
      } catch {
        // Not important
      }
      api.current.show(api.current.pickWelcome());
    }, 1600);
    return () => clearTimeout(id);
  }, []);

  /* ---------- Sleepy after a while with no activity ---------- */
  useEffect(() => {
    function active() {
      lastActive.current = Date.now();
      if (state.current.asleep && Date.now() >= napUntil.current) api.current.wake();
    }
    const names = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
    names.forEach((n) => window.addEventListener(n, active, { passive: true }));

    const id = setInterval(() => {
      const s = state.current;
      if (
        s.mode === "open" &&
        !s.asleep &&
        !s.busy &&
        !document.hidden &&
        Date.now() - lastActive.current > IDLE_MS
      ) {
        api.current.sleepNow();
      }
    }, 10000);

    return () => {
      names.forEach((n) => window.removeEventListener(n, active));
      clearInterval(id);
    };
  }, []);

  /* ---------- An occasional gentle nudge ---------- */
  useEffect(() => {
    let id;
    function schedule() {
      id = setTimeout(tick, (12 + Math.random() * 8) * 60 * 1000);
    }
    function tick() {
      const s = state.current;
      if (s.mode === "open" && !s.asleep && !s.bubble && !document.hidden && nudgeCount() < MAX_NUDGES) {
        bumpNudges();
        if (s.quietPassive) {
          // She's studying: just show the dot, and say it when she's clicked
          pending.current = api.current.nudge();
          setPing(true);
        } else {
          api.current.show(api.current.nudge());
        }
      }
      schedule();
    }
    schedule();
    return () => clearTimeout(id);
  }, []);

  /* ---------- React to things she really does ---------- */
  useEffect(() => {
    let prev = counts();

    function react(msg, important) {
      const t = Date.now();
      if (!important && t - lastEvent.current < 6000) return;
      lastEvent.current = t;
      api.current.show(msg);
    }

    function onStorage(e) {
      const key = e.detail && e.detail.key;
      if (!WATCHED.has(key)) return;
      const now = counts();
      const before = prev;
      prev = now;

      if (now.attempts > before.attempts) {
        const a = lastAttempt();
        const pct = a && a.total ? Math.round((a.score / a.total) * 100) : 0;
        const list = pct === 100 ? M.quizPerfect : pct >= 70 ? M.quizGood : M.quizTry;
        react(choose(list, `quiz${pct === 100 ? "p" : pct >= 70 ? "g" : "t"}`, recent), true);
        return;
      }
      if (now.studySessions > before.studySessions) {
        react(choose(M.sessionDone, "session", recent), true);
        return;
      }
      if (now.tasksDone > before.tasksDone || now.checklistDone > before.checklistDone) {
        const all = facts().allDoneToday;
        react(choose(all ? M.allDone : M.taskDone, all ? "alldone" : "task", recent), all);
        return;
      }
      if (now.flashReviews > before.flashReviews && now.flashReviews % 10 === 0) {
        react(
          {
            text: `You've reviewed ${now.flashReviews} flashcards so far. Great memory work!`,
            mood: "happy",
            fx: true,
          },
          false
        );
      }
    }

    function onPoppy(e) {
      const d = e.detail || {};
      if (d.name !== "upload") return;
      if (d.state === "start") {
        setBusy(true);
        later("busyGuard", () => {
          setBusy(false);
          api.current.hide();
        }, 60000);
        api.current.show(M.uploadStart);
      } else {
        cancel("busyGuard");
        setBusy(false);
        api.current.show(d.state === "done" ? M.uploadDone : M.uploadFail);
      }
    }

    window.addEventListener("pp:storage", onStorage);
    window.addEventListener("poppy", onPoppy);
    return () => {
      window.removeEventListener("pp:storage", onStorage);
      window.removeEventListener("poppy", onPoppy);
    };
  }, []);

  /* ---------- Escape and click-outside ---------- */
  useEffect(() => {
    if (!menu && !bubble) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (menu) setMenu(false);
      else api.current.hide();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu, bubble]);

  useEffect(() => {
    if (!menu) return;
    function onDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setMenu(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menu]);

  useEffect(() => {
    const all = timers.current;
    return () => Object.values(all).forEach(clearTimeout);
  }, []);

  /* ---------- Minimized: a small sleeping Poppy ---------- */
  if (mode === "min") {
    return (
      <div className="poppy poppy-min">
        <button
          type="button"
          className="poppy-sleeper"
          onClick={openFromMin}
          aria-label={ping ? "Wake Poppy. She has something to say" : "Wake Poppy"}
        >
          <PoppySvg mood="sleep" viewBox="18 2 84 84" />
          {ping && <span className="poppy-dot" aria-hidden="true" />}
        </button>
      </div>
    );
  }

  const shown = asleep ? "sleep" : busy && mood === "idle" ? "load" : mood;

  return (
    <div className="poppy" ref={rootRef} data-mood={shown}>
      {bubble && (
        <div
          key={bubble.key}
          className={`poppy-bubble${bubble.leaving ? " leaving" : ""}`}
          role="status"
          onPointerEnter={() => cancel("bubble")}
          onPointerLeave={() => {
            if (!bubble.sticky && !bubble.leaving) later("bubble", hide, 2500);
          }}
        >
          <button type="button" className="poppy-x" onClick={hide} aria-label="Close message">
            <X size={14} />
          </button>
          <span>{bubble.text}</span>
          {bubble.to && (
            <Link to={bubble.to} className="poppy-link" onClick={hide}>
              {bubble.label || "Open"}
            </Link>
          )}
        </div>
      )}

      {menu && (
        <div className="poppy-menu" role="group" aria-label="Poppy options">
          <button type="button" onClick={() => runMenu("hello")}>Say hello</button>
          <button type="button" onClick={() => runMenu("motivate")}>Give me motivation</button>
          <button type="button" onClick={() => runMenu("remind")}>Show me a reminder</button>
          <button type="button" onClick={() => runMenu("hide")}>Hide Poppy</button>
        </div>
      )}

      <div className="poppy-stage">
        <button
          type="button"
          className="poppy-ctl poppy-ctl-menu"
          onClick={() => {
            if (!menu) {
              cancel("bubble");
              setBubble(null);
            }
            setMenu(!menu);
          }}
          aria-label="Poppy options"
          aria-expanded={menu}
        >
          <Sparkles size={16} />
        </button>
        <button
          type="button"
          className="poppy-ctl poppy-ctl-min"
          onClick={minimize}
          aria-label="Minimize Poppy"
        >
          <Minus size={16} />
        </button>

        <button
          type="button"
          className="poppy-fig"
          onClick={onPoppyClick}
          aria-label={
            ping
              ? "Poppy the bunny has something to say. Click to hear it"
              : "Poppy the bunny. Click for a message"
          }
        >
          <PoppySvg mood={shown} />
        </button>

        {ping && <span className="poppy-dot" aria-hidden="true" />}

        {fx > 0 && (
          <span key={fx} className="poppy-hearts" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <svg key={i} viewBox="0 0 24 24" style={{ "--i": i }}>
                <path d={HEART} />
              </svg>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
