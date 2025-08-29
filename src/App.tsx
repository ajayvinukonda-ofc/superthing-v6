import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  title: string;
  tasks: string[];
}

interface DayState {
  completed: boolean;
  sections: { [sectionId: string]: boolean[] };
}

interface Day {
  id: number;
  date: string;
}

const MISSION_BLUEPRINT: Section[] = [
  {
    id: "physical",
    title: "Brutal Physical Training",
    tasks: [
      "Warm-Up: 5 minutes of dynamic stretches",
      "Core Circuit (5 rounds): 1-min plank, 50 V-ups, 50 leg raises",
      "Endurance Lungs: 100 burpees for full-body conditioning",
      "Sprinting: 10 sprints (100m) with short rests",
      "Cool Down: 5 minutes static stretching",
      "Pushing Power: 500 push-ups (sets of 25)",
      "Lower Body Engine: 500 squats (sets of 50)",
      "Pulling/Grip: 100 pull-ups OR 200 rows + 5 min dead hangs",
    ],
  },
  {
    id: "mind",
    title: "Mental Training & Focus",
    tasks: ["Meditation / Visualization (30 min)", "Read / Study (1 hr)", "Night Journal (15 min)"],
  },
  {
    id: "wealth",
    title: "Wealth & Skill Empire",
    tasks: ["Deep Work (4h): Code/AI/Projects", "Wealth Work (2h): study investments"],
  },
  {
    id: "influence",
    title: "Influence / YouTube Power",
    tasks: ["Influence Work (2h): script/edit/record", "Post or draft 1 piece"],
  },
];

const LS_KEY = "superthing_v6_state_v4";

function generateDays(numDays = 180): Day[] {
  const arr: Day[] = [];
  const today = new Date();
  for (let i = 1; i <= numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push({ id: i, date: d.toDateString() });
  }
  return arr;
}

export default function SuperthingV6() {
  const days = useMemo(() => generateDays(180), []);

  const [daysState, setDaysState] = useState<{ [dayId: number]: DayState }>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw).daysState;
    } catch (e) {}
    const init: { [dayId: number]: DayState } = {};
    days.forEach(d => {
      const sections: { [sectionId: string]: boolean[] } = {};
      MISSION_BLUEPRINT.forEach(sec => {
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
    setDaysState(prev => {
      const copy = { ...prev };
      const day = { ...copy[dayId] };
      const sections = { ...day.sections };
      const arr = [...sections[sectionId]];
      arr[taskIndex] = !arr[taskIndex];
      sections[sectionId] = arr;

      const allDone = MISSION_BLUEPRINT.every(sec => (sections[sec.id] || []).every(Boolean));
      const wasCompleted = day.completed;
      day.sections = sections;
      day.completed = allDone;
      copy[dayId] = day;

      if (!wasCompleted && allDone && dayId === currentDayId) {
        setStreak(s => s + 1);
        setCurrentDayId(cid => Math.min(cid + 1, days.length));
      }

      if (wasCompleted && !allDone) {
        setStreak(s => Math.max(0, s - 1));
      }

      return copy;
    });
  };

  const markMissedAndAdvance = () => {
    setDaysState(prev => {
      const copy = { ...prev };
      copy[currentDayId].completed = false;
      return copy;
    });
    setCurrentDayId(cid => Math.min(cid + 1, days.length));
  };

  const todayEntry = days.find(d => d.id === currentDayId) || days[0];
  const todayState = daysState[currentDayId];

  return (
    <div style={{ background: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, color: '#FFD700' }}>⚔️ Superthing Journal — V6</h1>
            <div style={{ color: '#aaa', marginTop: 6 }}>
              <strong>Day {currentDayId}</strong> &nbsp;|&nbsp; Streak: <strong>{streak}</strong> &nbsp;|&nbsp; {todayEntry.date}
            </div>
          </div>
          <div>
            <button onClick={markMissedAndAdvance} style={{ padding: '8px 12px', borderRadius: 8, background: '#1f1f1f', color: '#fff', border: '1px solid #333' }}>
              Skip / Mark missed & advance
            </button>
          </div>
        </header>

        {/* Today's missions */}
        <section style={{ background: '#1c1c1c', padding: 14, borderRadius: 12, marginBottom: 12 }}>
          <h2 style={{ marginTop: 0, color: '#ffa500' }}>{todayEntry.date} — {todayState?.completed ? '✅ Day Complete' : '❌ In Progress'}</h2>

          {MISSION_BLUEPRINT.map(sec => (
            <div key={sec.id} style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: '#222' }}>
              <strong style={{ color: '#f6c948', fontSize: 16 }}>{sec.title}</strong>
              <ul style={{ marginTop: 8 }}>
                {sec.tasks.map((task, idx) => {
                  const done = !!todayState?.sections?.[sec.id]?.[idx];
                  return (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <motion.span
                        style={{ width: 120, fontWeight: 'bold', color: done ? '#6EE7B7' : '#F87171' }}
                        animate={done ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {done ? '✅' : '❌'}
                      </motion.span>
                      <input type="checkbox" checked={done} onChange={() => toggleTask(currentDayId, sec.id, idx)} style={{ width: 18, height: 18 }} />
                      <span>{task}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>

        {/* Past Days */}
        <details style={{ background: '#1a1a1a', padding: 12, borderRadius: 10 }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '6px 0', color: '#ffa500' }}>📜 Past Days Log (completed + missed)</summary>
          <div style={{ marginTop: 10 }}>
            {days.slice(0, currentDayId).map(d => {
              const state = daysState[d.id];
              const status = state?.completed ? '✅ Completed' : '❌ Incomplete/Missed';
              return (
                <div key={d.id} style={{ padding: 10, borderBottom: '1px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>{d.date}</div>
                    <div style={{ color: state?.completed ? '#6EE7B7' : '#F87171' }}>{status}</div>
                  </div>
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: 'pointer' }}>View tasks</summary>
                    <div style={{ marginTop: 8 }}>
                      {MISSION_BLUEPRINT.map(sec => (
                        <div key={sec.id} style={{ marginBottom: 8 }}>
                          <strong style={{ color: '#f6c948' }}>{sec.title}</strong>
                          <ul style={{ marginTop: 6 }}>
                            {sec.tasks.map((task, idx) => (
                              <li key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ width: 120, color: state?.sections?.[sec.id]?.[idx] ? '#6EE7B7' : '#F87171' }}>
                                  {state?.sections?.[sec.id]?.[idx] ? '✅' : '❌'}
                                </span>
                                <span>{task}</span>
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



