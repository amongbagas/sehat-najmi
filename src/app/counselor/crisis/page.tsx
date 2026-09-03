"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./crisis.module.css";

interface CrisisAlert {
  id: string;
  participantId: string;
  status: string;
  notes: string | null;
  timestamp: string;
  student: {
    user: { name: string; email: string };
    class: string;
  };
}

export default function CrisisQueuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");

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
      fetchAlerts();
    }
  }, [status, session]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/crisis");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const res = await fetch("/api/crisis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "RESOLVED" }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAlerts = alerts.filter((a) =>
    filter === "ALL" ? true : a.status === filter
  );

  const pendingCount = alerts.filter((a) => a.status === "PENDING").length;

  if (status === "loading" || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Memuat data krisis...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>🚨 Antrian Krisis</h1>
          <p>Pantau dan tangani laporan darurat dari siswa</p>
        </div>
        {pendingCount > 0 && (
          <div className={styles.alertBadge}>
            {pendingCount} Menunggu
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {(["ALL", "PENDING", "RESOLVED"] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "Semua" : f === "PENDING" ? "Menunggu" : "Selesai"}
            {f === "PENDING" && pendingCount > 0 && (
              <span className={styles.count}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>✅</span>
          <h3>Tidak ada laporan krisis</h3>
          <p>Semua siswa dalam kondisi baik saat ini.</p>
        </div>
      ) : (
        <div className={styles.alertsList}>
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`${styles.alertCard} ${
                alert.status === "PENDING" ? styles.alertPending : styles.alertResolved
              }`}
            >
              <div className={styles.alertHeader}>
                <div className={styles.alertInfo}>
                  <span className={styles.alertIcon}>
                    {alert.status === "PENDING" ? "🔴" : "🟢"}
                  </span>
                  <div>
                    <h4>{alert.student?.user?.name || "Siswa"}</h4>
                    <span className={styles.alertMeta}>
                      Kelas {alert.student?.class || "-"} •{" "}
                      {new Date(alert.timestamp).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    alert.status === "PENDING" ? styles.badgePending : styles.badgeResolved
                  }`}
                >
                  {alert.status === "PENDING" ? "Menunggu" : "Selesai"}
                </span>
              </div>

              {alert.notes && (
                <div className={styles.alertNotes}>
                  <strong>Catatan:</strong> {alert.notes}
                </div>
              )}

              {alert.status === "PENDING" && (
                <div className={styles.alertActions}>
                  <button
                    className={styles.resolveBtn}
                    onClick={() => resolveAlert(alert.id)}
                  >
                    ✓ Tandai Selesai
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
