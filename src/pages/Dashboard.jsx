import { Fragment, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Check,
  X,
  ListChecks,
  CalendarCheck,
  FileText,
  TrendingUp,
  BookOpen,
  Heart,
  ArrowRight,
  Flame,
  Timer,
  CheckCircle,
  Layers,
  Shuffle,
} from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage.js";
import useDocuments from "../hooks/useDocuments.js";
import useTasks from "../hooks/useTasks.js";
import useChecklist from "../hooks/useChecklist.js";
import useFlashcards from "../hooks/useFlashcards.js";
import useQuizzes from "../hooks/useQuizzes.js";
import useParallax from "../hooks/useParallax.js";
import { useTimer } from "../context/TimerContext.jsx";
import { dueLabel, daysFromToday } from "../lib/dates.js";
import { sortTasks, todayTasksOf } from "../lib/planner.js";
import { computeStats } from "../lib/stats.js";
import { activityDaySet, currentStreak } from "../lib/streak.js";
import { Flower, Sprig } from "../components/Flower.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import CountUp from "../components/CountUp.jsx";
import PhotoFrame from "../components/PhotoFrame.jsx";
import NoteCard from "../components/NoteCard.jsx";

const messages = [
  "Small steps still count. One page at a time.",
  "You don't have to be perfect. You just have to keep showing up.",
  "Rest is part of studying too. Be kind to yourself today.",
  "Every lesson you review is helping someone in the future.",
  "You've handled hard days before. You can handle this one.",
  "Slow progress is still progress.",
  "Take a breath. You know more than you think you do.",
];

// One message per day to start with, so it stays the same until she asks for another
function dayIndex() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - startOfYear) / 86400000);
}

function hourGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Shows a sentence one word at a time
function AnimatedWords({ text }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={`${i}-${word}`}>
      <span className="word" style={{ "--w": i }}>
        {word}
      </span>{" "}
    </Fragment>
  ));
}

function EmptyState({ text, linkTo, linkLabel }) {
  return (
    <div className="empty">
      <p className="muted small">{text}</p>
      {linkTo && (
        <Link to={linkTo} className="btn btn-soft">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, value, label, hint, index }) {
  return (
    <div className="card kpi reveal" style={{ "--i": index }}>
      <span className="kpi-icon">
        <Icon size={20} />
      </span>
      <div className="kpi-body">
        <span className="kpi-value">
          <span className="sr-only">{value}</span>
          <span aria-hidden="true">
            <CountUp value={value} />
          </span>
        </span>
        <span className="kpi-label">{label}</span>
        <span className="muted small">{hint}</span>
      </div>
    </div>
  );
}

const quickLinks = [
  { to: "/library", label: "Study Library", hint: "Your lessons and PDFs", icon: BookOpen },
  { to: "/planner", label: "Planner", hint: "Tasks and study timer", icon: CalendarCheck },
  { to: "/progress", label: "Progress", hint: "See how far you've come", icon: TrendingUp },
  { to: "/notes", label: "A Little Note", hint: "Something for you", icon: Heart },
];

export default function Dashboard() {
  const { docs, loading: docsLoading } = useDocuments();
  const { tasks, toggleDone } = useTasks();
  const { items: allItems, todayItems, toggleItem } = useChecklist();
  const { cards } = useFlashcards();
  const { attempts } = useQuizzes();
  const { sessions } = useTimer();
  const [flashLog] = useLocalStorage("pp:flashcardLog", []);
  const [name, setName] = useLocalStorage("pp:greetingName", "future nurse");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [msgIndex, setMsgIndex] = useState(dayIndex);

  const heroRef = useRef(null);
  useParallax(heroRef);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Today's checklist: tasks due today plus quick items
  const checklist = [
    ...todayTasksOf(tasks).map((t) => ({
      key: `t-${t.id}`,
      text: t.title,
      done: t.done,
      toggle: () => toggleDone(t.id),
    })),
    ...todayItems.map((i) => ({
      key: `i-${i.id}`,
      text: i.text,
      done: i.done,
      toggle: () => toggleItem(i.id),
    })),
  ];
  const checklistDone = checklist.filter((c) => c.done).length;
  const checklistPercent = checklist.length
    ? Math.round((checklistDone / checklist.length) * 100)
    : 0;

  // Next open tasks
  const upcoming = sortTasks(tasks.filter((t) => !t.done)).slice(0, 4);

  // Everything below is counted from her real activity
  const { days, totals, hasAny } = computeStats({
    tasks,
    checklist: allItems,
    cards,
    flashLog,
    attempts,
    sessions,
  });
  const activeDays = activityDaySet({
    sessions,
    flashLog,
    attempts,
    tasks,
    checklist: allItems,
  });
  const streak = currentStreak(activeDays);
  const activeThisWeek = days.filter((d) => activeDays.has(d.key)).length;

  function startEditing() {
    setDraft(name);
    setEditing(true);
  }

  function saveName(e) {
    e.preventDefault();
    const cleaned = draft.trim().slice(0, 40);
    setName(cleaned || "future nurse");
    setEditing(false);
  }

  return (
    <div className="stack">
      {/* Greeting */}
      <section className="hero2 reveal" ref={heroRef} style={{ "--i": 0 }}>
        <div className="hero2-deco" aria-hidden="true">
          <div className="deco deco-1">
            <div className="float f1">
              <Flower size={150} />
            </div>
          </div>
          <div className="deco deco-2">
            <div className="float f2">
              <Flower size={68} tone="rose" />
            </div>
          </div>
          <div className="deco deco-3">
            <div className="float f3">
              <Flower size={40} />
            </div>
          </div>
          <div className="deco deco-4">
            <div className="float f4">
              <Sprig size={120} />
            </div>
          </div>
        </div>

        <div className="hero2-inner">
          <div className="hero2-text">
            <p className="eyebrow">
              {hourGreeting()} · {today}
            </p>

            {editing ? (
              <form className="row" onSubmit={saveName}>
                <input
                  className="input hero2-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={40}
                  aria-label="Name to show in the greeting"
                  autoFocus
                />
                <button className="btn btn-primary" type="submit">
                  <Check size={18} /> Save
                </button>
                <button
                  className="btn btn-outline btn-icon"
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label="Cancel"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <div className="hero2-title-row">
                <h1 className="hero2-title">
                  <AnimatedWords text={`Hi, ${name}! Ready for a little study session? 💗`} />
                </h1>
                <button
                  className="btn btn-outline btn-icon"
                  onClick={startEditing}
                  aria-label="Edit greeting name"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}

            <div className="hero2-message-row">
              <p className="hero2-message" key={msgIndex}>
                {messages[msgIndex % messages.length]}
              </p>
              <button
                className="msg-btn"
                onClick={() => setMsgIndex(msgIndex + 1)}
                aria-label="Show another message"
                title="Show another message"
              >
                <Shuffle size={16} />
              </button>
            </div>
          </div>

          <PhotoFrame />
        </div>
      </section>

      {/* Real numbers, counted from her activity */}
      <section className="kpi-grid" aria-label="Your activity at a glance">
        <Kpi
          icon={Flame}
          value={streak}
          label="Day streak"
          hint={streak > 0 ? "days in a row" : "Do something today to start"}
          index={1}
        />
        <Kpi
          icon={Timer}
          value={totals.weekMinutes}
          label="Minutes studied"
          hint="in the last 7 days"
          index={2}
        />
        <Kpi
          icon={CheckCircle}
          value={totals.tasksDone}
          label="Tasks completed"
          hint={`of ${totals.tasksTotal} planned`}
          index={3}
        />
        <Kpi
          icon={Layers}
          value={totals.flashReviews}
          label="Flashcard reviews"
          hint="all time"
          index={4}
        />
      </section>

      {/* Main cards */}
      <section className="dash-grid">
        <div className="card dash-card reveal" style={{ "--i": 5 }}>
          <div className="card-title">
            <ListChecks size={20} color="var(--rose)" />
            <h3>Today's checklist</h3>
          </div>
          {checklist.length === 0 ? (
            <EmptyState
              text="Nothing on your checklist today. Add items in the planner."
              linkTo="/planner"
              linkLabel="Open planner"
            />
          ) : (
            <div className="stack">
              <div className="check-head">
                <ProgressRing
                  percent={checklistPercent}
                  label={`${checklistDone} of ${checklist.length} done`}
                />
                <p className="muted small" style={{ margin: 0 }}>
                  {checklistDone} of {checklist.length} done
                </p>
              </div>
              <ul className="check-list">
                {checklist.slice(0, 6).map((c) => (
                  <li className="check-item" key={c.key}>
                    <label className="check">
                      <input type="checkbox" checked={c.done} onChange={c.toggle} />
                      <span className={c.done ? "done-text" : ""}>{c.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {checklistDone === checklist.length && <NoteCard category="congrats" compact />}
              {checklist.length > 6 && (
                <Link to="/planner" className="small">
                  See all {checklist.length} in the planner
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="card dash-card reveal" style={{ "--i": 6 }}>
          <div className="card-title">
            <CalendarCheck size={20} color="var(--rose)" />
            <h3>Upcoming study tasks</h3>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              text="No open tasks. Add tasks, quizzes and exams in the planner."
              linkTo="/planner"
              linkLabel="Go to planner"
            />
          ) : (
            <ul className="task-mini">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <span className={`dot dot-${t.priority}`} aria-hidden="true" />
                  <div className="task-mini-main">
                    <strong>{t.title}</strong>
                    <span
                      className={`small ${
                        t.dueDate && daysFromToday(t.dueDate) < 0 ? "due-overdue" : "muted"
                      }`}
                    >
                      {dueLabel(t.dueDate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card dash-card reveal" style={{ "--i": 7 }}>
          <div className="card-title">
            <FileText size={20} color="var(--rose)" />
            <h3>Recent study materials</h3>
          </div>
          {docsLoading ? (
            <div className="stack" aria-label="Loading your lessons">
              <div className="skeleton" style={{ width: "80%" }} />
              <div className="skeleton" style={{ width: "62%" }} />
              <div className="skeleton" style={{ width: "72%" }} />
            </div>
          ) : docs.length === 0 ? (
            <EmptyState
              text="No lessons yet. Add your first PDF in the Study Library."
              linkTo="/library"
              linkLabel="Open library"
            />
          ) : (
            <ul className="task-mini">
              {docs.slice(0, 3).map((d) => (
                <li key={d.id}>
                  <FileText size={16} color="var(--rose)" />
                  <div className="task-mini-main">
                    <Link to={`/library/${d.id}`}>{d.title}</Link>
                    <span className="muted small">{d.subject || "No subject"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card dash-card reveal" style={{ "--i": 8 }}>
          <div className="card-title">
            <TrendingUp size={20} color="var(--rose)" />
            <h3>This week</h3>
          </div>
          {!hasAny ? (
            <EmptyState
              text="No activity recorded yet. Finished tasks, quizzes and study sessions will appear here."
              linkTo="/progress"
              linkLabel="View progress"
            />
          ) : (
            <div className="stack">
              <div className="week-dots" role="img" aria-label={`Active on ${activeThisWeek} of the last 7 days`}>
                {days.map((d) => (
                  <div className="week-dot" key={d.key}>
                    <span
                      className={`week-dot-circle ${activeDays.has(d.key) ? "on" : ""} ${
                        d.isToday ? "today" : ""
                      }`}
                    />
                    <span className="muted">{d.label}</span>
                  </div>
                ))}
              </div>
              <p className="muted small" style={{ margin: 0 }}>
                Active on {activeThisWeek} of the last 7 days
                {totals.quizAttempts > 0 &&
                  ` · ${totals.quizAttempts} ${
                    totals.quizAttempts === 1 ? "quiz" : "quizzes"
                  } taken, average ${totals.quizAvg}%`}
              </p>
              <Link to="/progress" className="btn btn-soft">
                View progress
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="reveal" style={{ "--i": 9 }}>
          Quick links
        </h2>
        <div className="quick-grid">
          {quickLinks.map(({ to, label, hint, icon: Icon }, i) => (
            <Link
              key={to}
              to={to}
              className="card card-interactive quick-link reveal"
              style={{ "--i": 10 + i }}
            >
              <span className="quick-icon">
                <Icon size={20} />
              </span>
              <div>
                <strong>{label}</strong>
                <div className="muted small">{hint}</div>
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
