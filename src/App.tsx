import React, { useEffect, useMemo, useState } from "react";

type Task = {
  time: string;
  task: string;
};

type Section = {
  id: string;
  title: string;
  tasks: Task[];
};

type DayState = {
  sections: {
    [key: string]: boolean[];
  };
  completed: boolean;
};

type DaysState = {
  [dayId: number]: DayState;
};

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

export default function App() {
  const days = useMemo(() => generateDays(180), []);
  const [daysState, setDaysState] = useState<DaysState>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw).daysState;
    } catch (e) {}
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
    } catch (e) {}
    return 1;
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw).streak || 0;
    } catch (e) {}
    return 0;
  });

  useEffect(() => {
    const payload = { daysState, currentDayId, streak };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch (e) {}
  }, [daysState, currentDayId, streak]);

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
      }
      if (wasCompleted && !allDone) {
        setStreak((s) => Math.max(0, s - 1));
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

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>⚔️ Superthing Journal — V6</h1>
            <div style={{ color: "#ddd", marginTop: 6 }}>
              <strong>Day {currentDayId}</strong> &nbsp;|&nbsp; Streak: <strong>{streak}</strong> &nbsp;|&nbsp; {todayEntry.date}
            </div>
          </div>
          <div>
            <button
              onClick={markMissedAndAdvance}
              style={{ padding: "8px 12px", borderRadius: 8, background: "#222", color: "#fff", border: "1px solid #444" }}
            >
              Skip / Mark missed & advance
            </button>
          </div>
        </header>

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
                    <input type="checkbox" checked={done} onChange={() => toggleTask(currentDayId, sec.id, idx)} />
                    <span>{item.task}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <details style={{ background: "#0b0b0b", padding: 12, borderRadius: 10 }}>
          <summary style={{ cursor: "pointer", fontWeight: "600", padding: "6px 0" }}>📜 Past Days Log</summary>
          <div style={{ marginTop: 10 }}>
            {days.slice(0, currentDayId).map((d) => {
              const state = daysState[d.id];
              const status = state?.completed ? "✅ Completed" : "❌ Incomplete/Missed";
              return (
                <div key={d.id} style={{ padding: 10, borderBottom: "1px solid #222" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>{d.date}</div>
                    <div style={{ color: state?.completed ? "#6EE7B7" : "#F87171" }}>{status}</div>
                  </div>
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: "pointer" }}>View tasks</summary>
                    <div style={{ marginTop: 8 }}>
                      {MISSION_BLUEPRINT.map((sec) => (
                        <div key={sec.id} style={{ marginBottom: 8 }}>
                          <strong style={{ color: "#f6c948" }}>{sec.title}</strong>
                          <ul style={{ marginTop: 6 }}>
                            {sec.tasks.map((item, idx) => (
                              <li style={{ display: "flex", gap: 8, alignItems: "center" }} key={idx}>
                                <span style={{ width: 80, color: daysState[d.id]?.sections?.[sec.id]?.[idx] ? "#6EE7B7" : "#F87171" }}>
                                  {item.time}
                                </span>
                                <span style={{ width: 20 }}>{daysState[d.id]?.sections?.[sec.id]?.[idx] ? "✅" : "❌"}</span>
                                <span>{item.task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
}




