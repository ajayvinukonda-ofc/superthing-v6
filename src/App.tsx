// App.tsx
import React, { useEffect, useMemo, useState } from "react";
import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";

// ------------------ Types ------------------
type Task = { time: string; task: string };
type Section = { id: string; title: string; tasks: Task[] };
type DayState = { sections: { [key: string]: boolean[] }; completed: boolean };
type DaysState = { [dayId: number]: DayState };
type BadgeLog = { level: number; title: string; date: string };

// ------------------ Timetable ------------------
const MISSION_BLUEPRINT: Section[] = [
  {
    id: "morning_fitness",
    title: "Morning Fitness & Martial Arts (5:00AM - 7:10AM)",
    tasks: [
      { time: "05:00 - 05:10", task: "Warm-up & Mobility: Jumping jacks, skipping rope, joint rotations, light shadowboxing" },
      { time: "05:10 - 05:40", task: "Strength (Calisthenics): Push-ups, Pull-ups, Squats, Lunges, Dips, Plank" },
      { time: "05:40 - 06:10", task: "Martial Arts Basics: Stances, Footwork, Punches, Kicks, Combinations, Shadowboxing" },
      { time: "06:10 - 06:40", task: "Conditioning & Explosive Power: Burpees, Mountain climbers, Jump squats, Sprint intervals" },
      { time: "06:40 - 06:55", task: "Stretching & Flexibility: Yoga poses + hamstring, neck, shoulder stretches" },
      { time: "06:55 - 07:10", task: "Meditation: 5 min breathing, 5 min body scan, 5 min mantra" },
    ],
  },
  {
    id: "python_fullstack_learning",
    title: "Python + Full-Stack Learning (9:30AM - 1:00PM & 2:00PM - 3:00PM)",
    tasks: [
      { time: "09:30 - 11:30", task: "Morning: Python Core / Django / SQL / Git" },
      { time: "11:30 - 1:00", task: "Midday: GitHub, project updates, mini projects" },
      { time: "02:00 - 03:00", task: "Afternoon: Continue project / React / portfolio / job prep" },
    ],
  },
  {
    id: "youtube_channel",
    title: "YouTube Channel (3:00PM - 4:30PM)",
    tasks: [
      { time: "03:00 - 03:15", task: "Video planning / script writing" },
      { time: "03:15 - 04:00", task: "Recording + Editing" },
      { time: "04:00 - 04:30", task: "Uploading + SEO + Thumbnails" },
    ],
  },
  {
    id: "evening_fitness",
    title: "Evening Fitness / Martial Arts (4:30PM - 6:00PM)",
    tasks: [
      { time: "04:30 - 04:40", task: "Warm-up: Skipping rope 3 min, Mobility drills" },
      { time: "04:40 - 05:10", task: "Martial Arts Focus: Combos, Defense drills, Bag/pillow strikes, Kick–punch combinations" },
      { time: "05:10 - 05:30", task: "Strength + Core: Push-up variations, Inverted rows, Leg raises, Side planks" },
      { time: "05:30 - 05:45", task: "Conditioning: Sprint intervals, Burpees, Skater jumps" },
      { time: "05:45 - 06:00", task: "Stretching + Meditation: Quick yoga stretches + calming meditation" },
    ],
  },
];

// ------------------ Helpers ------------------
function generateDays(numDays = 180) {
  const arr: { id: number; date: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push({ id: i, date: d.toDateString() });
  }
  return arr;
}

// ------------------ Local Storage Keys ------------------
const LS_KEY = "superhuman_timetable";
const XP_KEY = "superhuman_xp";
const BADGE_LOG_KEY = "superhuman_badges";
const HABITS_KEY = "superhuman_habits";

// ------------------ Particles ------------------
const particlesOptions: ISourceOptions = {
  background: { color: "transparent" },
  fpsLimit: 60,
  interactivity: { events: { onHover: { enable: true, mode: "repulse" } }, modes: { repulse: { distance: 100 } } },
  particles: {
    color: { value: ["#ff0080", "#00ffff", "#ffff00"] },
    links: { enable: true, distance: 150, color: "#fff", opacity: 0.3, width: 1 },
    move: { enable: true, speed: 2, outModes: "bounce" },
    number: { value: 80, density: { enable: true } },
    opacity: { value: 0.6 },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 3 } },
  },
};

// ------------------ Badges ------------------
const BADGES = [
  { level: 1, title: "Soldier", icon: "🛡️" },
  { level: 5, title: "Warrior", icon: "⚔️" },
  { level: 10, title: "Lord", icon: "👑" },
  { level: 20, title: "Legend", icon: "🔥" },
  { level: 50, title: "Immortal King", icon: "💀👑" },
];
const getBadge = (level: number) => {
  let badge = BADGES[0];
  for (const b of BADGES) if (level >= b.level) badge = b;
  return badge;
};

// ------------------ Main App ------------------
export default function App() {
  const days = useMemo(() => generateDays(180), []);

  const [daysState, setDaysState] = useState<DaysState>({});
  const [currentDayId, setCurrentDayId] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [badgeLog, setBadgeLog] = useState<BadgeLog[]>([]);
  const [selectedPastDayId, setSelectedPastDayId] = useState<number | null>(null);
  const [showPastLogs, setShowPastLogs] = useState<boolean>(false);
  const [habits, setHabits] = useState<{ [key: string]: boolean }>({});

  // ------------------ Notifications Permission ------------------
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const notify = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  // ------------------ Initialize ------------------
  useEffect(() => {
    let saved: any = null;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    if (saved?.daysState) setDaysState(saved.daysState);
    else {
      const init: DaysState = {};
      days.forEach((d) => {
        const sections: { [key: string]: boolean[] } = {};
        MISSION_BLUEPRINT.forEach((sec) => (sections[sec.id] = Array(sec.tasks.length).fill(false)));
        init[d.id] = { sections, completed: false };
      });
      setDaysState(init);
    }
    setCurrentDayId(saved?.currentDayId || 1);
    setStreak(saved?.streak || 0);

    const habitsRaw = localStorage.getItem(HABITS_KEY);
    if (habitsRaw) setHabits(JSON.parse(habitsRaw));
  }, [days]);

  // ------------------ Save State ------------------
  useEffect(() => {
    if (!daysState) return;
    const payload = { daysState, currentDayId, streak };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    localStorage.setItem(`${XP_KEY}_xp`, xp.toString());
    localStorage.setItem(`${XP_KEY}_level`, level.toString());
    localStorage.setItem(BADGE_LOG_KEY, JSON.stringify(badgeLog));
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [daysState, currentDayId, streak, xp, level, badgeLog, habits]);

  const todayState = daysState[currentDayId] || { sections: {}, completed: false };

  // ------------------ Task Toggles ------------------
  const toggleTask = (dayId: number, sectionId: string, taskIndex: number) => {
    setDaysState((prev) => {
      const copy = { ...prev };
      if (!copy[dayId]) return prev;
      const day = { ...copy[dayId] };
      const sections = { ...day.sections };
      const arr = [...(sections[sectionId] || [])];
      arr[taskIndex] = !arr[taskIndex];
      sections[sectionId] = arr;

      const allDone = MISSION_BLUEPRINT.every((sec) => (sections[sec.id] || []).every(Boolean));
      day.sections = sections;
      day.completed = allDone;
      copy[dayId] = day;

      if (!day.completed && allDone && dayId === currentDayId) {
        setStreak((s) => s + 1);
        setCurrentDayId((cid) => Math.min(cid + 1, days.length));
        setXp((prev) => prev + 50);
        if ((level + 1) % 5 === 0) {
          const badge = getBadge(level + 1);
          setBadgeLog((prev) => [...prev, { level: badge.level, title: badge.title, date: new Date().toDateString() }]);
        }
        setLevel((prev) => prev + 1);
      }
      return copy;
    });
  };

  const toggleHabit = (key: string) => {
    setHabits((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const markMissedAndAdvance = () => {
    setCurrentDayId((cid) => Math.min(cid + 1, days.length));
  };

  const currentBadge = getBadge(level);

  // ------------------ Schedule Notifications ------------------
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    MISSION_BLUEPRINT.forEach((section) => {
      section.tasks.forEach((task) => {
        const [hourStr, minStr] = task.time.split(" - ")[0].split(":");
        const taskTime = new Date();
        taskTime.setHours(parseInt(hourStr), parseInt(minStr), 0, 0);

        const now = new Date();
        let diff = taskTime.getTime() - now.getTime();
        if (diff < 0) {
          diff += 24 * 60 * 60 * 1000; // Schedule for tomorrow
        }

        timers.push(
          setTimeout(() => {
            notify("Hey Light!", `Time for: ${task.task}`);
          }, diff)
        );
      });
    });

    return () => timers.forEach(clearTimeout);
  }, [currentDayId]);

  // ------------------ Render ------------------
  return (
    <div style={{ background: "linear-gradient(135deg, #1e1e1e, #333)", minHeight: "100vh", color: "#fff", position: "relative", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <Particles options={particlesOptions} style={{ position: "absolute", zIndex: 0, top: 0, left: 0, width: "100%", height: "100%" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 140, height: 140, borderRadius: 16, background: "linear-gradient(135deg,#FFD700,#FFAA00)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#222", fontWeight: "bold", fontSize: 16, textAlign: "center", boxShadow: "0 0 20px gold" }}>
              <div style={{ fontSize: 40 }}>{currentBadge.icon}</div>
              <div>{currentBadge.title}</div>
              <div>Level {level}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "#0ff", color: "#000", fontWeight: "bold" }}>Day {currentDayId}</div>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "#ff0", color: "#000", fontWeight: "bold" }}>Streak: {streak}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <button onClick={markMissedAndAdvance} style={{ background: "#ff0080", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", height: 40 }}>
              Skip Today
            </button>

            {/* Daily Habits Box behind Skip Today */}
            <div style={{ padding: 12, borderRadius: 12, background: "rgba(50,30,70,0.9)", boxShadow: "0 0 20px rgba(255, 165, 0,0.6)", display: "flex", flexDirection: "column", gap: 6 }}>
              <h4 style={{ margin: 0, color: "#ffdd00", textAlign: "center", marginBottom: 6, textShadow: "0 0 8px #ffdd00" }}>💧 Daily Habits</h4>
              {[
                { key: "No Porn", icon: "🚫" },
                { key: "No Junk", icon: "🍟" },
                { key: "No Sugar", icon: "🍭" },
                { key: "5L Water", icon: "💧" },
              ].map((habit) => (
                <label
                  key={habit.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    cursor: "pointer",
                    padding: "4px 6px",
                    borderRadius: 6,
                    background: habits[habit.key] ? "rgba(255,255,0,0.2)" : "transparent",
                    boxShadow: habits[habit.key] ? "0 0 10px rgba(255, 255, 0, 0.8)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <input type="checkbox" checked={!!habits[habit.key]} onChange={() => toggleHabit(habit.key)} />
                  <span style={{ fontWeight: habits[habit.key] ? "bold" : "normal", color: habits[habit.key] ? "#ff0" : "#fff", textShadow: habits[habit.key] ? "0 0 6px #ff0" : "none" }}>
                    {habit.icon} {habit.key}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </header>

        {/* Timetable */}
        {MISSION_BLUEPRINT.map((sec) => (
          <section key={sec.id} style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: "rgba(40,40,50,0.85)", boxShadow: "0 0 20px rgba(0,255,255,0.2)" }}>
            <h2 style={{ textShadow: "0 0 8px #0ff" }}>{sec.title}</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {sec.tasks.map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", margin: "6px 0", cursor: "pointer" }} onClick={() => toggleTask(currentDayId, sec.id, i)}>
                  <span style={{ display: "inline-block", width: 20, height: 20, borderRadius: "50%", border: "2px solid #fff", marginRight: 10, background: todayState.sections[sec.id]?.[i] ? "#ff0080" : "transparent" }}></span>
                  <span style={{ textDecoration: todayState.sections[sec.id]?.[i] ? "line-through" : "none", color: todayState.sections[sec.id]?.[i] ? "#888" : "#fff" }}>
                    {t.time} → {t.task}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Past Logs */}
        <section style={{ marginTop: 30, padding: 16, borderRadius: 12, background: "rgba(40,40,50,0.85)", boxShadow: "0 0 20px rgba(255,0,255,0.2)" }}>
          <h2 style={{ textShadow: "0 0 8px #ff00ff", cursor: "pointer" }} onClick={() => setShowPastLogs((prev) => !prev)}>
            🏅 Past Logs {showPastLogs ? "▲" : "▼"}
          </h2>
          {showPastLogs && (
            <div style={{ maxHeight: 300, overflowY: "auto", marginTop: 10 }}>
              {days.map((d) => (
                <div key={d.id} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => setSelectedPastDayId(d.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: daysState[d.id]?.completed ? "#0f0a" : "#f00a",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {d.date} - {daysState[d.id]?.completed ? "Completed" : "Incomplete"}
                  </button>
                </div>
              ))}

              {selectedPastDayId && (
                <div style={{ marginTop: 16, padding: 10, background: "#222", borderRadius: 8 }}>
                  <h3 style={{ marginTop: 0 }}>Details for {days.find((d) => d.id === selectedPastDayId)?.date}</h3>
                  {MISSION_BLUEPRINT.map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 10 }}>
                      <strong>{sec.title}</strong>
                      <ul style={{ paddingLeft: 20 }}>
                        {sec.tasks.map((t, i) => (
                          <li key={i} style={{ color: daysState[selectedPastDayId]?.sections[sec.id]?.[i] ? "#0f0" : "#f00" }}>
                            {t.time} → {t.task} ({daysState[selectedPastDayId]?.sections[sec.id]?.[i] ? "Done" : "Missed"})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <button onClick={() => setSelectedPastDayId(null)} style={{ marginTop: 10, padding: "6px 12px", borderRadius: 6, border: "none", background: "#ff0080", color: "#fff", cursor: "pointer" }}>
                    Close Details
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


