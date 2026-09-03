"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./students.module.css";
import Link from "next/link";

const MOOD_LABELS: Record<number, string> = { 1: "Very Bad", 2: "Bad", 3: "Okay", 4: "Good", 5: "Very Good" };
const MOOD_COLORS = ["#E53E3E", "#ED8936", "#ECC94B", "#48BB78", "#38A169"];

export default function StudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
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
      fetchStudents();
    }
  }, [status, session, router]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/counselor/students");
      if (res.ok) {
        const json = await res.json();
        setStudents(json);
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
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Student Roster</h1>
        <p>Monitor your students' mental health and activities.</p>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NIS</th>
              <th>Name</th>
              <th>Class</th>
              <th>Last Mood</th>
              <th>Activity Info</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.participantId}>
                <td>{student.nis}</td>
                <td style={{ fontWeight: 500 }}>{student.name}</td>
                <td>{student.className}</td>
                <td>
                  {student.lastMood ? (
                    <span className={styles.moodBadge} style={{ background: MOOD_COLORS[student.lastMood - 1] }}>
                      {MOOD_LABELS[student.lastMood]}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>No Data</span>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div>Journals: {student.journalCount}</div>
                    <div>CBT: {student.cbtCount}</div>
                  </div>
                </td>
                <td>
                  <Link href={`/counselor/students/${student.participantId}`} className={styles.actionButton}>
                    View Detail
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
