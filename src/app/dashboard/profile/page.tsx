"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "./profile.module.css";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  studentProfile?: {
    nis: string;
    class: string;
    participantId: string;
  } | null;
  counselorProfile?: {
    nip: string | null;
  } | null;
}

export default function ProfilePage() {
  const { status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Memuat profil...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className={styles.errorContainer}>Gagal memuat profil.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>👤 Profil Pengguna</h1>
        <p>Informasi akun dan data diri Anda</p>
      </div>

      <div className={styles.card}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {(profile.name || "?")[0].toUpperCase()}
          </div>
          <div className={styles.profileTitle}>
            <h2>{profile.name}</h2>
            <span className={styles.roleBadge}>
              {profile.role === "STUDENT" ? "Siswa" : profile.role === "COUNSELOR" ? "Guru BK" : profile.role}
            </span>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailGroup}>
            <label>Email</label>
            <div className={styles.detailValue}>{profile.email || "-"}</div>
          </div>

          <div className={styles.detailGroup}>
            <label>Tanggal Bergabung</label>
            <div className={styles.detailValue}>
              {new Date(profile.createdAt).toLocaleDateString("id-ID", {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>

          {profile.role === "STUDENT" && profile.studentProfile && (
            <>
              <div className={styles.detailGroup}>
                <label>NIS</label>
                <div className={styles.detailValue}>{profile.studentProfile.nis}</div>
              </div>
              <div className={styles.detailGroup}>
                <label>Kelas</label>
                <div className={styles.detailValue}>{profile.studentProfile.class}</div>
              </div>
              <div className={styles.detailGroup}>
                <label>ID Peserta (Anonim)</label>
                <div className={styles.detailValue}>
                  <code className={styles.codeBlock}>{profile.studentProfile.participantId}</code>
                </div>
              </div>
            </>
          )}

          {profile.role === "COUNSELOR" && profile.counselorProfile && (
            <div className={styles.detailGroup}>
              <label>NIP</label>
              <div className={styles.detailValue}>{profile.counselorProfile.nip || "-"}</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: 'rgba(231, 76, 60, 0.1)', 
              color: '#e74c3c', 
              border: '1px solid rgba(231, 76, 60, 0.2)', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.1)'; e.currentTarget.style.color = '#e74c3c'; }}
          >
            <span>🚪</span> Keluar (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}
