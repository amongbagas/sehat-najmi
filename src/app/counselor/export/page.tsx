"use client";

import { useState } from "react";
import styles from "../counselor.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const EXPORTS = [
  {
    id: "mood",
    title: "Mood Tracker Data",
    desc: "All mood check-in entries with participantId, moodValue, notes, and timestamps.",
    icon: "😊",
    cols: "participantId, moodValue, note, timestamp",
  },
  {
    id: "assessment",
    title: "Pre/Post Assessment",
    desc: "All pre-test and post-test scores per participant for comparative analysis.",
    icon: "📋",
    cols: "participantId, type (PRE/POST), score, timestamp",
  },
  {
    id: "survey",
    title: "Usability Survey",
    desc: "Satisfaction and usability ratings submitted by students.",
    icon: "⭐",
    cols: "participantId, usabilityScore, satisfaction, featureRating, feedback",
  },
  {
    id: "engagement",
    title: "Engagement Summary",
    desc: "Per-participant totals for all activity types — great for engagement research.",
    icon: "📊",
    cols: "participantId, class, moodEntries, journalEntries, cbtSessions, gameSessions...",
  },
];

export default function ExportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && !["COUNSELOR", "ADMIN", "RESEARCHER"].includes(session.user.role)) {
      router.push("/dashboard");
    }
  }, [status, session]);

  const handleExport = async (type: string) => {
    setDownloading(type);
    try {
      const res = await fetch(`/api/export?type=${type}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sehat_${type}_export.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Export failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Research Data Export</h1>
        <p>Download anonymized research data as CSV. All exports are linked to Participant ID only — no personal identity data is included.</p>
      </div>

      <div style={{ background: 'rgba(231, 76, 60, 0.06)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '8px' }}>
        <strong style={{ color: 'var(--error)' }}>⚠ Research Ethics Notice:</strong>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
          This data is intended for academic research only. All exports are anonymized. Do not attempt to cross-reference Participant IDs with student identity records without proper IRB approval.
        </p>
      </div>

      <div className={styles.chartsGrid}>
        {EXPORTS.map(exp => (
          <div key={exp.id} className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '32px' }}>{exp.icon}</span>
              <div>
                <h3 style={{ margin: 0 }}>{exp.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{exp.desc}</p>
              </div>
            </div>
            <code style={{ fontSize: '12px', background: 'var(--background)', padding: '10px 14px', borderRadius: '6px', display: 'block', color: 'var(--secondary)' }}>
              Columns: {exp.cols}
            </code>
            <button
              className="btn btn-primary"
              onClick={() => handleExport(exp.id)}
              disabled={downloading === exp.id}
              style={{ backgroundColor: downloading === exp.id ? '#E2E8F0' : 'var(--accent)', color: downloading === exp.id ? 'var(--text-muted)' : 'white' }}
            >
              {downloading === exp.id ? "Preparing..." : "⬇ Download CSV"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
