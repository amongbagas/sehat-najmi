"use client";

import { useState } from "react";
import styles from "../cbt/cbt.module.css";
import { useRouter } from "next/navigation";

const PRETEST_QUESTIONS = [
  "I often feel overwhelmed by my schoolwork.",
  "I find it easy to manage my time effectively.",
  "I know how to calm myself down when I feel stressed.",
  "I feel confident in my ability to handle personal challenges.",
  "I can easily identify the emotions I am feeling."
];

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(new Array(PRETEST_QUESTIONS.length).fill(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSelect = (qIndex: number, val: number) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = val;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    // Just a sum for demonstration
    return answers.reduce((a, b) => a + b, 0);
  };

  const handleSubmit = async () => {
    if (answers.includes(0)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    const finalScore = calculateScore();

    try {
      await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PRE_TEST", score: finalScore }),
      });
      setCompleted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className={styles.container}>
        <div className={styles.activityScreen}>
          <h2>Assessment Completed</h2>
          <p>Thank you for completing the pre-test. Your responses have been safely recorded.</p>
          <button className="btn btn-primary" onClick={() => router.push("/dashboard")} style={{ marginTop: '24px' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pre-Test Assessment</h1>
        <p>Please answer the following questions to help us understand your current baseline.</p>
      </div>

      <div className={styles.activityScreen} style={{ maxWidth: '800px', textAlign: 'left' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).
        </p>

        {PRETEST_QUESTIONS.map((q, idx) => (
          <div key={idx} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
            <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '16px' }}>{idx + 1}. {q}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => handleSelect(idx, val)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: answers[idx] === val ? 'var(--accent)' : '#E2E8F0',
                    background: answers[idx] === val ? 'rgba(0, 180, 169, 0.1)' : 'white',
                    cursor: 'pointer',
                    fontWeight: answers[idx] === val ? 700 : 400,
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        ))}

        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={isSubmitting || answers.includes(0)}
          style={{ width: '100%' }}
        >
          {isSubmitting ? "Submitting..." : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}
