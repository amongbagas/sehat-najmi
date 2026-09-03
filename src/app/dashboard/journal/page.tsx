"use client";

import { useState, useEffect } from "react";
import styles from "./journal.module.css";
import { useRouter } from "next/navigation";

const PROMPTS = [
  "What has been on your mind today?",
  "Write one thing you are proud of.",
  "What's one thing you want to improve tomorrow?",
  "Describe a moment that made you smile recently.",
  "What is a challenge you are facing, and how can you overcome it?",
];

export default function JournalPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Select random prompt on load
    randomizePrompt();
    fetchHistory();
  }, []);

  const randomizePrompt = () => {
    const random = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(random);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch journals", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, content }),
      });

      if (res.ok) {
        setContent("");
        randomizePrompt();
        fetchHistory(); // refresh history
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to submit journal", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Personal Journal</h1>
        <p>Your private space to reflect, write, and process your thoughts safely.</p>
      </div>

      <div className={styles.editorCard}>
        <div className={styles.promptSection}>
          <div className={styles.promptLabel}>Prompt of the moment</div>
          <p className={styles.promptText}>{prompt}</p>
        </div>
        
        <textarea
          className={styles.textarea}
          placeholder="Start writing here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div className={styles.actions}>
          <button 
            className={`btn ${styles.btnSecondary}`}
            onClick={randomizePrompt}
            type="button"
          >
            Change Prompt
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            style={{ backgroundColor: 'var(--secondary)' }}
          >
            {isSubmitting ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>

      <div className={styles.historyCard}>
        <h2>Your Past Entries</h2>
        
        {isLoading ? (
          <p>Loading journals...</p>
        ) : history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't written any journals yet.</p>
        ) : (
          <div className={styles.historyList}>
            {history.map((entry) => {
              const date = new Date(entry.timestamp);
              
              return (
                <div key={entry.id} className={styles.historyItem}>
                  <div className={styles.historyItemHeader}>
                    {entry.prompt && <h3 className={styles.historyPrompt}>{entry.prompt}</h3>}
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
