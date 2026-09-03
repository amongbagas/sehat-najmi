"use client";

import { useState, useEffect } from "react";
import styles from "../journal/journal.module.css";
import { useRouter } from "next/navigation";

export default function GratitudePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/gratitude");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch gratitude", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/gratitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent("");
        fetchHistory(); // refresh history
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to submit gratitude", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gratitude Log</h1>
        <p>Take a moment to appreciate the good things in your life, no matter how small.</p>
      </div>

      <div className={styles.editorCard}>
        <div className={styles.promptSection}>
          <div className={styles.promptLabel}>Today's Prompt</div>
          <p className={styles.promptText}>What are three things you are grateful for today?</p>
        </div>
        
        <textarea
          className={styles.textarea}
          placeholder="I am grateful for..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ minHeight: '120px' }}
        />
        
        <div className={styles.actions}>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isSubmitting ? "Saving..." : "Save Gratitude"}
          </button>
        </div>
      </div>

      <div className={styles.historyCard}>
        <h2>Your Gratitude History</h2>
        
        {isLoading ? (
          <p>Loading gratitude entries...</p>
        ) : history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't logged any gratitude yet.</p>
        ) : (
          <div className={styles.historyList}>
            {history.map((entry) => {
              const date = new Date(entry.timestamp);
              
              return (
                <div key={entry.id} className={styles.historyItem} style={{ borderLeft: '4px solid var(--accent)' }}>
                  <div className={styles.historyItemHeader}>
                    <div className={styles.historyDate}>
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <p className={styles.historyContent}>{entry.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
