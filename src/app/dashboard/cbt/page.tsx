"use client";

import { useState, useEffect } from "react";
import styles from "./cbt.module.css";

const ACTIVITIES = [
  {
    id: "breathing",
    title: "Breathing Exercise",
    desc: "A CBT-inspired activity to calm your nervous system using the 4-4-4 breathing technique.",
    icon: "😮‍💨",
  },
  {
    id: "thought-check",
    title: "Thought Check",
    desc: "Identify and reframe negative thoughts into more balanced perspectives.",
    icon: "🧠",
  },
  {
    id: "reflection",
    title: "Emotion Reflection",
    desc: "Map your emotions and understand the situations that trigger them.",
    icon: "🔍",
  }
];

export default function CbtPage() {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  
  // Breathing State
  const [breathState, setBreathState] = useState<"Breathe In" | "Hold" | "Breathe Out">("Breathe In");
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeActivity === "breathing" && isBreathing) {
      interval = setInterval(() => {
        setBreathState(prev => {
          if (prev === "Breathe In") return "Hold";
          if (prev === "Hold") return "Breathe Out";
          setBreathCount(c => c + 1);
          return "Breathe In";
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [activeActivity, isBreathing]);

  const completeActivity = async (type: string, duration: number) => {
    try {
      await fetch("/api/cbt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType: type, duration, completed: true }),
      });
      alert("Activity completed and saved! Great job.");
      setActiveActivity(null);
      setIsBreathing(false);
      setBreathCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathState("Breathe In");
  };

  if (activeActivity === "breathing") {
    return (
      <div className={styles.container}>
        <button className={`btn btn-secondary ${styles.backBtn}`} onClick={() => { setActiveActivity(null); setIsBreathing(false); }}>
          ← Back to Activities
        </button>
        <div className={styles.activityScreen}>
          <h2>Breathing Exercise</h2>
          <p>Follow the circle. Breathe in for 4s, hold for 4s, breathe out for 4s.</p>
          
          <div className={`${styles.breathingCircle} ${isBreathing ? (breathState === "Breathe In" ? styles.inhale : (breathState === "Breathe Out" ? styles.exhale : styles.inhale)) : ''}`}>
            {isBreathing ? breathState : "Ready?"}
          </div>
          
          {!isBreathing ? (
            <button className="btn btn-primary" onClick={startBreathing}>Start Exercise</button>
          ) : (
            <button className="btn btn-primary" style={{backgroundColor: 'var(--secondary)'}} onClick={() => completeActivity("breathing", breathCount * 12)}>
              Finish & Save
            </button>
          )}
        </div>
      </div>
    );
  }

  if (activeActivity === "thought-check") {
    return (
      <div className={styles.container}>
        <button className={`btn btn-secondary ${styles.backBtn}`} onClick={() => setActiveActivity(null)}>
          ← Back to Activities
        </button>
        <div className={styles.activityScreen}>
          <h2>Thought Check</h2>
          <div className={styles.activityStep}>
            <p><strong>1. Identify:</strong> What is the negative thought you are having?</p>
            <input type="text" style={{width: '100%', padding: '12px', marginTop: '8px'}} placeholder="e.g. I will fail this exam..." />
          </div>
          <div className={styles.activityStep}>
            <p><strong>2. Reframe:</strong> How can you look at this more realistically?</p>
            <input type="text" style={{width: '100%', padding: '12px', marginTop: '8px'}} placeholder="e.g. I have studied hard, I will do my best." />
          </div>
          <button className="btn btn-primary" onClick={() => completeActivity("thought-check", 60)}>
            Complete Reflection
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>CBT-Inspired Activities</h1>
        <p>Simple exercises to help you manage stress, reframe thoughts, and stay balanced.</p>
      </div>

      <div className={styles.grid}>
        {ACTIVITIES.map((act) => (
          <div key={act.id} className={styles.activityCard}>
            <div className={styles.icon}>{act.icon}</div>
            <h2 className={styles.title}>{act.title}</h2>
            <p className={styles.desc}>{act.desc}</p>
            <button className="btn btn-primary" onClick={() => setActiveActivity(act.id)}>
              Start Activity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
