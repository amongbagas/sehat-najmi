"use client";

import { useState } from "react";
import styles from "../cbt/cbt.module.css"; 

const MISSIONS = [
  {
    id: "m-1",
    title: "Hydration Check",
    desc: "Drink a glass of water right now to stay hydrated and refreshed.",
    icon: "💧",
    points: 10,
  },
  {
    id: "m-2",
    title: "Digital Detox",
    desc: "Take a 5-minute break away from all screens.",
    icon: "📱",
    points: 20,
  },
  {
    id: "m-3",
    title: "Stretch It Out",
    desc: "Stand up and do a quick 2-minute stretch.",
    icon: "🤸",
    points: 15,
  }
];

export default function MissionsPage() {
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeMission = async (missionId: string, title: string, points: number) => {
    if (completedMissions.includes(missionId)) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, status: "COMPLETED" }),
      });
      alert(`Mission Completed: ${title}! You earned ${points} points.`);
      setCompletedMissions(prev => [...prev, missionId]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Daily Missions</h1>
        <p>Complete small, healthy habits every day to build a better routine.</p>
      </div>

      <div className={styles.grid}>
        {MISSIONS.map((mission) => {
          const isCompleted = completedMissions.includes(mission.id);
          return (
            <div key={mission.id} className={styles.activityCard} style={{ opacity: isCompleted ? 0.6 : 1 }}>
              <div className={styles.icon}>{mission.icon}</div>
              <h2 className={styles.title}>{mission.title} <span style={{fontSize: '14px', color: 'var(--accent)', float: 'right'}}>+{mission.points} pts</span></h2>
              <p className={styles.desc}>{mission.desc}</p>
              
              <button 
                className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={() => completeMission(mission.id, mission.title, mission.points)}
                disabled={isCompleted || isSubmitting}
                style={isCompleted ? { backgroundColor: 'var(--success)', color: 'white', borderColor: 'var(--success)' } : {}}
              >
                {isCompleted ? "Completed ✓" : "Mark as Complete"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
