import { dateKey } from "./dates.js";

// Every day on which she really did something: a finished study session,
// a reviewed flashcard, a quiz, or a completed task or checklist item
export function activityDaySet({ sessions, flashLog, attempts, tasks, checklist }) {
  const days = new Set();

  function add(iso) {
    if (!iso) return;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) days.add(dateKey(d));
  }

  sessions.filter((s) => s.kind === "study").forEach((s) => add(s.at));
  flashLog.forEach((e) => add(e.at));
  attempts.forEach((a) => add(a.at));
  tasks.forEach((t) => t.done && add(t.doneAt));
  checklist.forEach((i) => i.done && add(i.doneAt));

  return days;
}

// Days in a row up to today. If she hasn't done anything yet today, yesterday still counts.
export function currentStreak(days) {
  const now = new Date();
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let count = 0;
  while (days.has(dateKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
