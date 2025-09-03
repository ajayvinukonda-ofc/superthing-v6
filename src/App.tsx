import React, { useEffect, useMemo, useState } from "react";

// ------------------ Types ------------------
type Task = { time: string; task: string };
type Section = { id: string; title: string; tasks: Task[] };
type DayState = { sections: { [key: string]: boolean[] }; completed: boolean };
type DaysState = { [dayId: number]: DayState };

// ------------------ Mission Blueprint ------------------
const MISSION_BLUEPRINT: Section[] = [
  {
    id: "morning_workout",
    title: "Morning Workout (6AM - 8AM)",
    tasks: [
      { time: "06:00 AM", task: "Warm-up: 5 min dynamic stretches" },
      { time: "06:10 AM", task: "Core Circuit: Plank 1 min, 50 V-ups, 50 leg raises" },
      { time: "06:40 AM", task: "Endurance: 100 burpees" },
      { time: "07:10 AM", task: "Push-ups: 500 push-ups in sets" },
      { time: "07:40 AM", task: "Squats: 500 bodyweight squats" },
      { time: "08:00 AM", task: "Cool Down & Freshen up / Breakfast (1.5h)" },
    ],
  },
  {
    id: "morning_productivity",
    title: "Morning Productivity (9AM - 12PM)",
    tasks: [
      { time: "09:00 AM", task: "Deep Work / Study / Coding" },
      { time: "10:30 AM", task: "Mini Break 10 min" },
      { time: "10:40 AM", task: "Continue Work / Learning" },
      { time: "12:00 PM", task: "Lunch / Freshen up (1.5h)" },
    ],
  },
  {
    id: "afternoon_work",
    title: "Afternoon Work / Projects (1:30PM - 5PM)",
    tasks: [
      { time: "01:30 PM", task: "Project Work / AI / Stock Market Study" },
      { time: "03:30 PM", task: "Mini Break 10 min" },
      { time: "03:40 PM", task: "Continue Deep Work" },
    ],
  },
  {
    id: "evening_workout",
    title: "Evening Workout (5PM - 7PM)",
    tasks: [
      { time: "05:00 PM", task: "Pull-ups / Rows / Grip Strength" },
      { time: "05:30 PM", task: "Mobility & Light Cardio" },
      { time: "06:00 PM", task: "Core & Stretching" },
      { time: "06:30 PM", task: "Cooldown & Freshen up / Dinner (1.5h)" },
    ],
  },
  {
    id: "night_creative",
    title: "Creative / Influence / YouTube (8:00PM - 10:00PM)",
    tasks: [
      { time: "08:00 PM", task: "Script / Record / Edit content" },
      { time: "09:00 PM", task: "Plan Next Day / Engagement" },
      { time: "10:00 PM", task: "Wind down / Light Reading" },
    ],
  },
  {
    id: "night_wind_down",
    title: "Night / Journaling / Meditation (10:00PM - 10:30PM)",
    tasks: [
      { time: "10:00 PM", task: "Meditation / Journaling / Visualization" },
      { time: "10:15 PM", task: "Prepare for sleep" },
    ],
  },
];

// ------------------ Helpers ------------------
function generateDays(numDays = 180) {
  const arr = [];
  const today = new Date();
  for (let i = 1; i <= numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push({ id: i, date: d.toDateString() });
  }
  return arr;
}

const LS_KEY = "superthing_v6_timetable_v3";
const XP_KEY = "superthing_xp";

// ------------------ Main App ------------------
export default function App() {
  const days = useMemo(() => generateDays(180), []);

  // Timetable State
  const [daysState, setDaysState] = useState<DaysState>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw).daysState;
    } catch {}
    const init: DaysState = {};
    days.forEach((d) => {
      const sections: { [key: string]: boolean[] } = {};
      MISSION_BLUEPRINT.forEach((sec) => {
        sections[sec.id] = Array(sec.tasks.length).fill(false);
      });
      init[d.id] = { sections, completed: false };
    });
    return init;
  });

  const [currentDayId, setCurrentDayId] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw).currentDayId;
    } catch {}
    return 1;
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw).streak || 0;
    } catch {}
    return 0;
  });

  // XP + Level State
  const [xp, setXp] = useState(() => {
    const savedXp = localStorage.getItem(`${XP_KEY}_xp`);
    return savedXp ? parseInt(savedXp, 10) : 0;
  });

  const [level, setLevel] = useState(() => {
    const savedLevel = localStorage.getItem(`${XP_KEY}_level`);
    return savedLevel ? parseInt(savedLevel, 10) : 1;
  });

  // Save Timetable + XP
  useEffect(() => {
    try {
      const payload = { daysState, currentDayId, streak };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
      localStorage.setItem(`${XP_KEY}_xp`, xp.toString());
      localStorage.setItem(`${XP_KEY}_level`, level.toString());
    } catch {}
  }, [daysState, currentDayId, streak, xp, level]);

  // XP / Level system
  useEffect(() => {
    if (xp >= 100) {
      setLevel((prev) => prev + 1);
      setXp(0);
    }
  }, [xp]);

  const getTitle = (level: number): string => {
    if (level < 5) return "Novice Warrior ⚔️";
    if (level < 10) return "Knight 🛡️";
    if (level < 20) return "Lord 👑";
    if (level < 50) return "Legend 🔥";
    return "Immortal King 💀👑";
  };

  // Notifications
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
    const checkNotifications = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h === 6 && m === 0) new Notification("🔥 Time for Morning Workout!");
      if (h === 17 && m === 0) new Notification("⚔️ Evening Training Begins!");
      if (h === 22 && m === 30) new Notification("💤 Sleep Time — Recharge for tomorrow!");
    }, 60000);
    return () => clearInterval(checkNotifications);
  }, []);

  // Toggle Task
  const toggleTask = (dayId: number, sectionId: string, taskIndex: number) => {
    setDaysState((prev) => {
      const copy = { ...prev };
      const day = { ...copy[dayId] };
      const sections = { ...day.sections };
      const arr = [...sections[sectionId]];
      arr[taskIndex] = !arr[taskIndex];
      sections[sectionId] = arr;

      const allDone = MISSION_BLUEPRINT.every(
        (sec) => (sections[sec.id] || []).every(Boolean)
      );
      const wasCompleted = day.completed;
      day.sections = sections;
      day.completed = allDone;
      copy[dayId] = day;

      if (!wasCompleted && allDone && dayId === currentDayId) {
        setStreak((s) => s + 1);
        setCurrentDayId((cid) => Math.min(cid + 1, days.length));
        setXp((prev) => prev + 50); // bonus XP for completing a day
      }
      return copy;
    });
  };

  const markMissedAndAdvance = () => {
    setDaysState((prev) => {
      const copy = { ...prev };
      copy[currentDayId].completed = false;
      return copy;
    });
    setCurrentDayId((cid) => Math.min(cid + 1, days.length));
  };

  const todayEntry = days.find((d) => d.id === currentDayId) || days[0];
  const todayState = daysState[currentDayId];

  // ------------------ UI ------------------
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>⚔️ Superhuman Journal — V6</h1>
            <div style={{ color: "#ddd", marginTop: 6 }}>
              <strong>Day {currentDayId}</strong> | Streak: <strong>{streak}</strong> | {todayEntry.date}
            </div>
            <div style={{ marginTop: 8 }}>
              <h2>
                Level {level} — {getTitle(level)}
              </h2>
              <progress value={xp} max={100}></progress>
              <p>{xp}/100 XP</p>
            </div>
          </div>
          <button
            onClick={markMissedAndAdvance}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          >
            Skip / Mark missed & advance
          </button>
        </header>

        {/* XP Button */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setXp((prev) => prev + 20)}
            style={{
              padding: "10px 20px",
              backgroundColor: "black",
              color: "white",
              border: "1px solid #444",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ✅ Complete Extra Task (+20 XP)
          </button>
        </div>

        {/* Daily Sections */}
        {MISSION_BLUEPRINT.map((sec) => (
          <div key={sec.id} style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "#111" }}>
            <strong style={{ color: "#f6c948", fontSize: 18 }}>{sec.title}</strong>
            <ul style={{ marginTop: 8 }}>
              {sec.tasks.map((item, idx) => {
                const done = !!todayState?.sections?.[sec.id]?.[idx];
                return (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ width: 80, color: "#aaa" }}>{item.time}</span>
                    <span style={{ width: 20 }}>{done ? "✅" : "❌"}</span>
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleTask(currentDayId, sec.id, idx)}
                    />
                    <span>{item.task}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Past Days Log */}
        <details style={{ background: "#0b0b0b", padding: 12, borderRadius: 10 }}>
          <summary style={{ cursor: "pointer", fontWeight: "600" }}>📜 Past Days Log</summary>
          <div style={{ marginTop: 10 }}>
            {days.slice(0, currentDayId).map((d) => {
              const state = daysState[d.id];
              const status = state?.completed ? "✅ Completed" : "❌ Missed";
              return (
                <div key={d.id} style={{ padding: 10, borderBottom: "1px solid #222" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>{d.date}</div>
                    <div style={{ color: state?.completed ? "#6EE7B7" : "#F87171" }}>{status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
}
