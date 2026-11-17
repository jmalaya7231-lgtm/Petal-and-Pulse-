// What Poppy says when she greets you
export const welcome = [
  { text: "Hello! Welcome back! 🌸", mood: "wave" },
  { text: "It's lovely to see you again!", mood: "wave" },
  { text: "Ready to learn something new today?", mood: "wave" },
  { text: "Hi hi! I saved your spot. 💗", mood: "wave" },
];

export function timeGreeting(hour) {
  if (hour < 5) return { text: "Still up? Remember to rest soon. 🌙", mood: "wave" };
  if (hour < 12) return { text: "Good morning! A little study goes a long way. 🌸", mood: "wave" };
  if (hour < 18) return { text: "Good afternoon! Ready for a study session?", mood: "wave" };
  return { text: "Good evening! Let's finish the day gently. 🌷", mood: "wave" };
}

// Encouragement
export const encourage = [
  { text: "You're doing amazing! Keep going!", mood: "happy", fx: true },
  { text: "One step at a time. You've got this!", mood: "happy" },
  { text: "Small steps still count. 🌸", mood: "idle" },
  { text: "Every page you read is helping a future patient.", mood: "happy" },
  { text: "You know more than you think you do.", mood: "idle" },
  { text: "Be kind to yourself. You're learning something hard.", mood: "idle" },
];

// General reminders, used when there's nothing specific to remind her about
export const selfcare = [
  { text: "Remember to take a little break!", mood: "remind" },
  { text: "Stay hydrated and take care of yourself! 💧", mood: "remind" },
  { text: "Roll your shoulders back and stretch your neck.", mood: "remind" },
  { text: "Rest your eyes for a moment. Look at something far away.", mood: "remind" },
  { text: "Have you eaten today? Your brain needs fuel.", mood: "remind" },
  {
    text: "Don't forget to check your upcoming activities!",
    mood: "remind",
    to: "/planner",
    label: "Open planner",
  },
  {
    text: "Time to review your learning progress!",
    mood: "remind",
    to: "/progress",
    label: "See progress",
  },
];

// Reactions after something real happens
export const taskDone = [
  { text: "Another one done. You're on a roll!", mood: "happy" },
  { text: "Checked off! That's real progress.", mood: "happy" },
  { text: "Nice work. One less thing to worry about.", mood: "happy" },
];

export const allDone = [
  { text: "You finished everything for today! I'm so proud of you. 💗", mood: "happy", fx: true },
  { text: "Today's list is all done. Time to rest!", mood: "happy", fx: true },
];

export const sessionDone = [
  { text: "Study session complete! Take a little break.", mood: "happy", fx: true },
  { text: "You stayed focused. Well done! Now rest your eyes.", mood: "happy", fx: true },
];

export const quizPerfect = [
  { text: "A perfect score! Wow, I'm so proud of you. 🌸", mood: "happy", fx: true },
  { text: "Every answer right! Your hard work really shows.", mood: "happy", fx: true },
];

export const quizGood = [
  { text: "Great score! Keep up the good work.", mood: "happy", fx: true },
  { text: "You're really getting this. Nice job!", mood: "happy", fx: true },
];

export const quizTry = [
  { text: "Every quiz teaches something. Check the ones you missed and try again when you're ready.", mood: "idle" },
  { text: "That's okay. Going over the missed ones is how it sticks.", mood: "idle" },
  { text: "Not your best round, but you showed up. That counts. 💗", mood: "idle" },
];

// PDF uploads
export const uploadStart = {
  text: "Reading your PDF... I'll wait right here!",
  mood: "idle",
  sticky: true,
};
export const uploadDone = {
  text: "Your lesson is in the library. Time to highlight the good parts!",
  mood: "happy",
  fx: true,
};
export const uploadFail = {
  text: "Hmm, that one didn't work. The message on the page says why.",
  mood: "think",
};

// When she's clicked many times quickly
export const ticklish = [
  { text: "Hehe, that tickles! 🌸", mood: "happy", fx: true },
  { text: "Eep! Hehe!", mood: "happy" },
  { text: "Okay, okay, I'm listening!", mood: "happy" },
];
export const breather = { text: "Okay, okay! Let me catch my breath... 💤", mood: "idle" };

// Builds a reminder from her real planner and flashcards. real=false means nothing to report.
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const when = (d) => (d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`);
const short = (t) => (t.length > 36 ? `${t.slice(0, 36)}…` : t);

export function buildReminder(f) {
  if (f.overdueCount > 0) {
    return {
      real: true,
      mood: "remind",
      text: `You have ${plural(f.overdueCount, "overdue task", "overdue tasks")}. Want to tackle one today?`,
      to: "/planner",
      label: "Open planner",
    };
  }
  if (f.dueTodayCount > 0) {
    return {
      real: true,
      mood: "remind",
      text: `You have ${plural(f.dueTodayCount, "task", "tasks")} due today.`,
      to: "/planner",
      label: "Open planner",
    };
  }
  if (f.nextExam) {
    const kind = f.nextExam.type === "exam" ? "exam" : "quiz";
    const name = f.nextExam.title ? ` “${short(f.nextExam.title)}”` : "";
    return {
      real: true,
      mood: "remind",
      text: `Your ${kind}${name} is ${when(f.nextExam.days)}. A little review will help!`,
      to: "/planner",
      label: "Open planner",
    };
  }
  if (f.itemsLeft > 0) {
    return {
      real: true,
      mood: "remind",
      text: `You still have ${plural(f.itemsLeft, "item", "items")} on today's checklist.`,
      to: "/planner",
      label: "Open planner",
    };
  }
  if (f.unreviewedCards > 0) {
    return {
      real: true,
      mood: "remind",
      text: `You have ${plural(f.unreviewedCards, "flashcard", "flashcards")} not marked reviewed yet.`,
      to: "/flashcards",
      label: "Study cards",
    };
  }
  return { real: false };
}
