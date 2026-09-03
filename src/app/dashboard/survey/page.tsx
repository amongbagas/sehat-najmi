"use client";

import { useState } from "react";
import styles from "../cbt/cbt.module.css";
import { useRouter } from "next/navigation";

export default function SurveyPage() {
  const router = useRouter();
  const [usabilityScore, setUsabilityScore] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [featureRating, setFeatureRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async () => {
    if (!usabilityScore || !satisfaction || !featureRating) {
      alert("Please provide ratings for all required fields.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usabilityScore, satisfaction, featureRating, feedback }),
      });
      setCompleted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRating = (label: string, value: number, setter: (val: number) => void) => (
    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
      <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '16px' }}>{label}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map(val => (
          <button
            key={val}
            onClick={() => setter(val)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: value === val ? 'var(--accent)' : '#E2E8F0',
              background: value === val ? 'rgba(0, 180, 169, 0.1)' : 'white',
              cursor: 'pointer',
              fontWeight: value === val ? 700 : 400,
            }}
          >
            {val}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Poor / Strongly Disagree</span>
        <span>Excellent / Strongly Agree</span>
      </div>
    </div>
  );

  if (completed) {
    return (
      <div className={styles.container}>
        <div className={styles.activityScreen}>
          <h2>Survey Completed</h2>
          <p>Thank you for your feedback! Your input helps us improve SEHAT.</p>
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
        <h1>Usability & Satisfaction Survey</h1>
        <p>Help us improve by sharing your experience with the platform.</p>
      </div>

      <div className={styles.activityScreen} style={{ maxWidth: '800px', textAlign: 'left' }}>
        {renderRating("1. How easy was it to navigate and use the website?", usabilityScore, setUsabilityScore)}
        {renderRating("2. Overall, how satisfied are you with SEHAT?", satisfaction, setSatisfaction)}
        {renderRating("3. How helpful did you find the core features (AI, Mood, CBT)?", featureRating, setFeatureRating)}

        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>4. Any open feedback or suggestions? (Optional)</p>
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '100px', fontFamily: 'inherit' }}
            placeholder="I really liked... I think you could improve..."
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={isSubmitting || !usabilityScore || !satisfaction || !featureRating}
          style={{ width: '100%', backgroundColor: 'var(--secondary)' }}
        >
          {isSubmitting ? "Submitting..." : "Submit Survey"}
        </button>
      </div>
    </div>
  );
}
