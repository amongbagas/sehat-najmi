"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./progress.module.css";

const MOOD_LABELS: Record<number, string> = {
  1: "Sangat Buruk", 2: "Buruk", 3: "Biasa", 4: "Baik", 5: "Sangat Baik"
};
const MOOD_COLORS = ["#E53E3E", "#ED8936", "#ECC94B", "#48BB78", "#38A169"];
const MOOD_EMOJI = ["😞", "😟", "😐", "😊", "😄"];

interface ProgressData {
  moodChart: { date: string; value: number | null }[];
  stats: {
    totalMoodEntries: number;
    totalJournals: number;
    totalCbt: number;
    totalGames: number;
    totalMissions: number;
    totalGratitudes: number;
    avgMood: string | null;
    streak: number;
  };
  assessments: { pre: number | null; post: number | null };
}

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") fetchProgress();
  }, [status]);

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/progress");
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  if (isLoading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Memuat data progress...</p>
    </div>
  );

  if (!data) return <div className={styles.loading}>Gagal memuat data.</div>;

  const { stats, moodChart, assessments } = data;
  const avgMoodNum = parseFloat(stats.avgMood || "0");
  const maxMoodVal = Math.max(...moodChart.map(d => d.value ?? 0), 1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📈 Progress Kamu</h1>
        <p>Ringkasan perjalanan kesehatan mentalmu selama ini</p>
      </div>

      {/* Streak & Average */}
      <div className={styles.heroGrid}>
        <div className={styles.streakCard}>
          <div className={styles.streakIcon}>🔥</div>
          <div className={styles.streakNum}>{stats.streak}</div>
          <div className={styles.streakLabel}>Hari Berturut-turut</div>
          <p className={styles.streakSub}>Pertahankan konsistensimu!</p>
        </div>

        <div className={styles.avgCard}>
          <div className={styles.avgEmoji}>
            {avgMoodNum > 0 ? MOOD_EMOJI[Math.round(avgMoodNum) - 1] : "—"}
          </div>
          <div className={styles.avgNum}>{stats.avgMood ?? "—"} / 5</div>
          <div className={styles.avgLabel}>Rata-rata Mood</div>
          <p className={styles.avgSub}>
            {avgMoodNum >= 4 ? "Kamu sedang baik-baik saja! 🎉"
              : avgMoodNum >= 3 ? "Terus semangat ya!"
              : avgMoodNum > 0 ? "Ingat, kamu tidak sendiri 💙"
              : "Belum ada data mood"}
          </p>
        </div>
      </div>

      {/* Mood Chart — last 7 days */}
      <div className={styles.card}>
        <h2>Mood 7 Hari Terakhir</h2>
        <div className={styles.chartArea}>
          {moodChart.map((day, i) => (
            <div key={i} className={styles.chartCol}>
              <div className={styles.barWrapper}>
                {day.value !== null ? (
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(day.value / 5) * 100}%`,
                      background: MOOD_COLORS[day.value - 1],
                    }}
                    title={MOOD_LABELS[day.value]}
                  >
                    <span className={styles.barEmoji}>{MOOD_EMOJI[day.value - 1]}</span>
                  </div>
                ) : (
                  <div className={styles.barEmpty} />
                )}
              </div>
              <div className={styles.chartLabel}>{day.date}</div>
            </div>
          ))}
        </div>
        <div className={styles.chartLegend}>
          {Object.entries(MOOD_LABELS).map(([val, label]) => (
            <div key={val} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: MOOD_COLORS[Number(val) - 1] }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Stats */}
      <div className={styles.card}>
        <h2>Ringkasan Aktivitas</h2>
        <div className={styles.statsGrid}>
          {[
            { icon: "😊", label: "Mood Check-in", value: stats.totalMoodEntries },
            { icon: "📝", label: "Jurnal", value: stats.totalJournals },
            { icon: "🧘", label: "CBT Selesai", value: stats.totalCbt },
            { icon: "🎮", label: "Games Selesai", value: stats.totalGames },
            { icon: "🎯", label: "Misi Selesai", value: stats.totalMissions },
            { icon: "🙏", label: "Gratitude", value: stats.totalGratitudes },
          ].map(item => (
            <div key={item.label} className={styles.statCard}>
              <span className={styles.statIcon}>{item.icon}</span>
              <span className={styles.statValue}>{item.value}</span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Comparison */}
      <div className={styles.card}>
        <h2>Hasil Assessment</h2>
        {assessments.pre === null && assessments.post === null ? (
          <p className={styles.emptyText}>Kamu belum mengerjakan assessment. <a href="/dashboard/assessment" className={styles.link}>Kerjakan sekarang →</a></p>
        ) : (
          <div className={styles.assessGrid}>
            <div className={styles.assessItem}>
              <div className={styles.assessLabel}>Pre-Test</div>
              {assessments.pre !== null ? (
                <>
                  <div className={styles.assessScore}>{assessments.pre}<span>/25</span></div>
                  <div className={styles.assessBar}>
                    <div className={styles.assessFill} style={{ width: `${(assessments.pre / 25) * 100}%`, background: 'var(--secondary)' }} />
                  </div>
                </>
              ) : <div className={styles.assessNA}>Belum dikerjakan</div>}
            </div>

            <div className={styles.assessArrow}>→</div>

            <div className={styles.assessItem}>
              <div className={styles.assessLabel}>Post-Test</div>
              {assessments.post !== null ? (
                <>
                  <div className={styles.assessScore}>{assessments.post}<span>/25</span></div>
                  <div className={styles.assessBar}>
                    <div className={styles.assessFill} style={{ width: `${(assessments.post / 25) * 100}%`, background: 'var(--accent)' }} />
                  </div>
                </>
              ) : <div className={styles.assessNA}>Belum dikerjakan</div>}
            </div>

            {assessments.pre !== null && assessments.post !== null && (
              <div className={`${styles.assessDiff} ${assessments.post >= assessments.pre ? styles.positive : styles.negative}`}>
                {assessments.post >= assessments.pre ? "+" : ""}{assessments.post - assessments.pre} poin
                <span>{assessments.post >= assessments.pre ? " ↑ Meningkat!" : " ↓ Menurun"}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
