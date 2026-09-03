"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../students.module.css";
import Link from "next/link";

const MOOD_LABELS: Record<number, string> = { 1: "Very Bad", 2: "Bad", 3: "Okay", 4: "Good", 5: "Very Good" };
const MOOD_COLORS = ["#E53E3E", "#ED8936", "#ECC94B", "#48BB78", "#38A169"];

export default function StudentDetailPage({ params }: { params: { participantId: string } }) {
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
      if (!["COUNSELOR", "ADMIN"].includes(session.user.role)) {
        router.push("/dashboard");
        return;
      }
      fetchStudentDetail();
    }
  }, [status, session, router, params.participantId]);

  const fetchStudentDetail = async () => {
    try {
      const res = await fetch(`/api/counselor/students/${params.participantId}`);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--background)' }}>
        <p>Loading detail...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div style={{ padding: '40px', background: 'var(--background)', minHeight: '100vh' }}>
        <h1>Error loading student</h1>
        <Link href="/counselor/students" style={{ color: 'var(--primary)' }}>← Back to roster</Link>
      </div>
    );
  }

  const { profile, moodHistory, assessments, completedMissions, completedCbt } = data;

  const preTest = assessments.find((a: any) => a.type === "PRE_TEST");
  const postTest = assessments.find((a: any) => a.type === "POST_TEST");

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', background: 'var(--primary)', padding: '32px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>SEHAT</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '13px' }}>Counselor Panel</p>
        </div>
        <nav style={{ padding: '24px 0' }}>
          {[
            { label: "Overview", href: "/counselor", icon: "📊" },
            { label: "Student Data", href: "/counselor/students", icon: "👥" },
            { label: "Research Export", href: "/counselor/export", icon: "📤" },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', 
              color: item.href === '/counselor/students' ? 'white' : 'rgba(255,255,255,0.8)', 
              background: item.href === '/counselor/students' ? 'rgba(255,255,255,0.1)' : 'transparent',
              textDecoration: 'none', fontSize: '14px', fontWeight: 500 
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div className={styles.container}>
          <Link href="/counselor/students" style={{ color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', display: 'inline-block' }}>
            ← Back to Roster
          </Link>
          
          <div className={styles.header}>
            <h1>{profile.name}</h1>
            <p>NIS: {profile.nis} | Class: {profile.className} | Participant ID: {profile.participantId}</p>
          </div>

          <div className={styles.detailGrid}>
            {/* Health Overview */}
            <div className={styles.card}>
              <h3>Health Overview</h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Recent Mood Check-ins</span>
                <span className={styles.infoValue}>{moodHistory.length} recorded</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Completed Interventions</span>
                <span className={styles.infoValue}>{completedCbt.length} Sessions</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Missions Completed</span>
                <span className={styles.infoValue}>{completedMissions.length} Missions</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Assessment (Pre-Test)</span>
                <span className={styles.infoValue}>{preTest ? `${preTest.score}/25` : "Not taken"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Assessment (Post-Test)</span>
                <span className={styles.infoValue}>{postTest ? `${postTest.score}/25` : "Not taken"}</span>
              </div>
              
              {preTest && postTest && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: postTest.score > preTest.score ? 'var(--success)' : 'var(--error)' }}>
                    {postTest.score > preTest.score ? "Mental health improvement detected" : "No improvement or slight decline"} 
                    ({postTest.score - preTest.score} points)
                  </p>
                </div>
              )}
            </div>

            {/* Mood History Timeline */}
            <div className={styles.card}>
              <h3>Recent Mood History</h3>
              {moodHistory.length > 0 ? (
                <div className={styles.moodHistoryList}>
                  {moodHistory.slice(0, 5).map((mood: any) => (
                    <div key={mood.id} className={styles.moodItem}>
                      <div className={styles.moodDot} style={{ background: MOOD_COLORS[mood.moodValue - 1] }} />
                      <div className={styles.moodDate}>
                        {new Date(mood.timestamp).toLocaleDateString()} at {new Date(mood.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={styles.moodNote}>
                        {mood.note ? `"${mood.note}"` : ""}
                      </div>
                    </div>
                  ))}
                  {moodHistory.length > 5 && (
                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      + {moodHistory.length - 5} older records
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No mood records found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
