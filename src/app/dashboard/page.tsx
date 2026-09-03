"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  const firstName = session?.user?.name?.split(" ")[0] || "Kamu";
  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{greeting}, {firstName} 👋</h1>
          <p>Bagaimana kabarmu hari ini? Yuk, cek kondisi mentalmu.</p>
        </div>
        
        <div className={styles.headerRight}>
          <Link href="/dashboard/profile" className={styles.profileBtn} style={{ textDecoration: 'none' }}>
            <div className={styles.avatar}>{firstName.charAt(0)}</div>
            <span>Profil</span>
          </Link>
        </div>
      </header>

      <div className={styles.grid}>
        <Link href="/dashboard/mood" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>😊</div>
            <h2 className={styles.cardTitle}>Cek Mood</h2>
          </div>
          <p className={styles.cardDesc}>Bagaimana perasaanmu hari ini?</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Isi Sekarang</button>
        </Link>

        <Link href="/dashboard/ai" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>✨</div>
            <h2 className={styles.cardTitle}>SEHAT AI</h2>
          </div>
          <p className={styles.cardDesc}>Cerita apa saja ke teman AI-mu yang suportif.</p>
          <button className="btn btn-accent" style={{ width: '100%' }}>Chat Sekarang</button>
        </Link>

        <Link href="/dashboard/missions" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🎯</div>
            <h2 className={styles.cardTitle}>Misi Harian</h2>
          </div>
          <p className={styles.cardDesc}>Luangkan 5 menit untuk dirimu hari ini.</p>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--secondary)' }}>Lihat Misi</button>
        </Link>

        <Link href="/dashboard/journal" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>📝</div>
            <h2 className={styles.cardTitle}>Jurnal</h2>
          </div>
          <p className={styles.cardDesc}>Tuliskan pikiran dan perasaanmu.</p>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Tulis Sekarang</button>
        </Link>

        <Link href="/dashboard/gratitude" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🙏</div>
            <h2 className={styles.cardTitle}>Gratitude</h2>
          </div>
          <p className={styles.cardDesc}>Apa yang kamu syukuri hari ini?</p>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Tambah Syukur</button>
        </Link>

        <Link href="/dashboard/progress" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>📈</div>
            <h2 className={styles.cardTitle}>Progress</h2>
          </div>
          <p className={styles.cardDesc}>Pantau perjalanan kesehatan mentalmu.</p>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Lihat Progress</button>
        </Link>

        <Link href="/dashboard/forum" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🗣️</div>
            <h2 className={styles.cardTitle}>Peer Forum</h2>
          </div>
          <p className={styles.cardDesc}>Berbagi cerita dan saling mendukung sesama.</p>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Ke Forum</button>
        </Link>

        <Link href="/dashboard/inbox" className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>💬</div>
            <h2 className={styles.cardTitle}>Inbox</h2>
          </div>
          <p className={styles.cardDesc}>Chat langsung dengan Guru BK-mu.</p>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Buka Pesan</button>
        </Link>
      </div>
    </>
  );
}
