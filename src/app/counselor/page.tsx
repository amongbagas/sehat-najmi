"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./counselor.module.css";

const MOOD_LABELS: Record<number, string> = { 1: "Very Bad", 2: "Bad", 3: "Okay", 4: "Good", 5: "Very Good" };
const MOOD_COLORS = ["#E53E3E", "#ED8936", "#ECC94B", "#48BB78", "#38A169"];

export default function CounselorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (!["COUNSELOR", "ADMIN", "RESEARCHER"].includes(session.user.role)) {
        router.push("/dashboard");
        return;
      }
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard-stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!data) return <div style={{ padding: '40px' }}>Failed to load data.</div>;

  const maxMood = Math.max(...data.moodDistribution.map((m: any) => m.count), 1);
  const maxScore = 25; // 5 questions × 5 points

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>School Wellness Overview</h1>
        <p>Aggregate data across all students. All records are anonymized by Participant ID.</p>
      </div>

      {/* Stats Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Students</span>
          <span className={styles.statValue}>{data.stats.totalStudents}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Mood Check-ins</span>
          <span className={`${styles.statValue} ${styles.accent}`}>{data.stats.totalMoodEntries}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Journal Entries</span>
          <span className={`${styles.statValue} ${styles.secondary}`}>{data.stats.totalJournalEntries}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>AI Messages</span>
          <span className={styles.statValue}>{data.stats.totalAiMessages}</span>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Mood Distribution */}
        <div className={styles.chartCard}>
          <h3>Mood Distribution (Last 30)</h3>
          <div className={styles.moodBars}>
            {data.moodDistribution.map((mood: any) => (
              <div key={mood.value} className={styles.moodBarRow}>
                <span className={styles.moodBarLabel}>{MOOD_LABELS[mood.value]}</span>
                <div className={styles.moodBarTrack}>
                  <div
                    className={styles.moodBarFill}
                    style={{
                      width: `${(mood.count / maxMood) * 100}%`,
                      background: MOOD_COLORS[mood.value - 1],
                    }}
                  />
                </div>
                <span className={styles.moodBarCount}>{mood.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment */}
        <div className={styles.chartCard}>
          <h3>Assessment: Pre vs Post Test</h3>
          <div className={styles.comparisonBars}>
            <div className={styles.compRow}>
              <div className={styles.compLabel}>
                <span className={styles.compLabelText}>Pre-Test Avg ({data.assessment.preCount} responses)</span>
                <span className={styles.compLabelValue}>{data.assessment.avgPre}/{maxScore}</span>
              </div>
              <div className={styles.compTrack}>
                <div className={styles.compFill} style={{ width: `${(data.assessment.avgPre / maxScore) * 100}%`, background: 'var(--secondary)' }} />
              </div>
            </div>
            <div className={styles.compRow}>
              <div className={styles.compLabel}>
                <span className={styles.compLabelText}>Post-Test Avg ({data.assessment.postCount} responses)</span>
                <span className={styles.compLabelValue}>{data.assessment.avgPost}/{maxScore}</span>
              </div>
              <div className={styles.compTrack}>
                <div className={styles.compFill} style={{ width: `${(data.assessment.avgPost / maxScore) * 100}%`, background: 'var(--accent)' }} />
              </div>
            </div>
            {data.assessment.preCount > 0 && data.assessment.postCount > 0 && (
              <p style={{ fontSize: '13px', color: data.assessment.avgPost > data.assessment.avgPre ? 'var(--success)' : 'var(--error)', fontWeight: 600, margin: '8px 0 0' }}>
                {data.assessment.avgPost > data.assessment.avgPre
                  ? `↑ ${data.assessment.avgPost - data.assessment.avgPre} pt improvement after using SEHAT`
                  : data.assessment.avgPost < data.assessment.avgPre
                  ? `↓ ${data.assessment.avgPre - data.assessment.avgPost} pt change`
                  : "No change detected yet"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Survey */}
      <div className={styles.chartCard}>
        <h3>Average Usability Survey Results</h3>
        <div className={styles.surveyGrid}>
          <div className={styles.surveyItem}>
            <div className={styles.surveyScore}>{data.survey.avgUsability}/5</div>
            <div className={styles.surveyLabel}>Usability</div>
          </div>
          <div className={styles.surveyItem}>
            <div className={styles.surveyScore}>{data.survey.avgSatisfaction}/5</div>
            <div className={styles.surveyLabel}>Satisfaction</div>
          </div>
          <div className={styles.surveyItem}>
            <div className={styles.surveyScore}>{data.survey.avgFeatureRating}/5</div>
            <div className={styles.surveyLabel}>Feature Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
