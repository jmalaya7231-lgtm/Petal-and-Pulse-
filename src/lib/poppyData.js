import { dateKey, daysFromToday } from "./dates.js";

// Reads saved data fresh each time, so Poppy never works from old numbers
function read(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const value = raw === null ? [] : JSON.parse(raw);
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function counts() {
  return {
    tasksDone: read("pp:tasks").filter((t) => t.done).length,
    checklistDone: read("pp:checklist").filter((i) => i.done).length,
    attempts: read("pp:quizAttempts").length,
    studySessions: read("pp:sessions").filter((s) => s.kind === "study").length,
    flashReviews: read("pp:flashcardLog").length,
  };
}

export function lastAttempt() {
  const list = read("pp:quizAttempts");
  return list[list.length - 1] || null;
}

// Facts used for reminders. Everything here is counted from her real data.
export function facts() {
  const tasks = read("pp:tasks");
  const checklist = read("pp:checklist");
  const cards = read("pp:flashcards");
  const today = dateKey();

  const days = (t) => (t.dueDate ? daysFromToday(t.dueDate) : null);
  const open = tasks.filter((t) => !t.done);

  const overdueCount = open.filter((t) => days(t) !== null && days(t) < 0).length;
  const dueTodayCount = open.filter((t) => days(t) === 0).length;

  const tests = open
    .filter(
      (t) =>
        (t.type === "quiz" || t.type === "exam") &&
        days(t) !== null &&
        days(t) >= 0 &&
        days(t) <= 3
    )
    .sort((a, b) => days(a) - days(b));
  const next = tests[0];
  const nextExam = next
    ? { title: String(next.title || ""), type: next.type, days: days(next) }
    : null;

  const todayItems = checklist.filter((i) => i.date === today);
  const itemsLeft = todayItems.filter((i) => !i.done).length;

  // The same "today" list the dashboard shows
  const todayTasks = tasks.filter((t) => {
    const d = days(t);
    return d !== null && (d === 0 || (d < 0 && !t.done));
  });
  const total = todayTasks.length + todayItems.length;
  const done =
    todayTasks.filter((t) => t.done).length + todayItems.filter((i) => i.done).length;

  return {
    overdueCount,
    dueTodayCount,
    nextExam,
    itemsLeft,
    unreviewedCards: cards.filter((c) => !c.reviewed).length,
    allDoneToday: total > 0 && done === total,
  };
}
