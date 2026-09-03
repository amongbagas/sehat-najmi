"use client";

import { useState, useEffect } from "react";
import styles from "./mood.module.css";
import { useRouter } from "next/navigation";

const MOODS = [
  { value: 1, label: "Very Bad", emoji: "😢" },
  { value: 2, label: "Bad", emoji: "😟" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Very Good", emoji: "😁" },
];

export default function MoodPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/mood");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.moods || []);
      }
    } catch (error) {
      console.error("Failed to fetch mood history", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodValue: selectedMood, note }),
      });

      if (res.ok) {
        setNote("");
        setSelectedMood(null);
        fetchHistory(); // refresh history
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to submit mood", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Mood Tracker</h1>
        <p>Keep track of how you are feeling everyday to better understand yourself.</p>
      </div>

      <div className={styles.checkinCard}>
        <h2>How are you feeling today?</h2>
        
        <div className={styles.moodSelector}>
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              className={`${styles.moodOption} ${selectedMood === mood.value ? styles.selected : ""}`}
              onClick={() => setSelectedMood(mood.value)}
              type="button"
            >
              <span className={styles.moodEmoji}>{mood.emoji}</span>
              <span className={styles.moodLabel}>{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className={styles.noteSection}>
            <label className={styles.noteLabel}>Any thoughts or triggers? (Optional)</label>
            <textarea
              className={styles.noteInput}
              placeholder="I feel this way because..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={!selectedMood || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Mood"}
        </button>
      </div>

      <div className={styles.historyCard}>
        <h2>Your Recent Moods</h2>
        
        {isLoading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't logged any moods yet.</p>
        ) : (
          <div className={styles.historyList}>
            {history.map((entry) => {
              const moodDef = MOODS.find(m => m.value === entry.moodValue);
              const date = new Date(entry.timestamp);
              
              return (
                <div key={entry.id} className={styles.historyItem}>
                  <div className={styles.historyEmoji}>{moodDef?.emoji}</div>
                  <div className={styles.historyDetails}>
                    <p className={styles.historyMood}>{moodDef?.label}</p>
                    {entry.note && <p className={styles.historyNote}>{entry.note}</p>}
                  </div>
                  <div className={styles.historyDate}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
