"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import React from "react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: "🏠" },
  { name: "Mood", href: "/dashboard/mood", icon: "😊" },
  { name: "SEHAT AI", href: "/dashboard/ai", icon: "✨" },
  { name: "Journal", href: "/dashboard/journal", icon: "📝" },
  { name: "Activities", href: "/dashboard/cbt", icon: "🧘" },
  { name: "Games", href: "/dashboard/games", icon: "🎮" },
  { name: "Missions", href: "/dashboard/missions", icon: "🎯" },
  { name: "Assessment", href: "/dashboard/assessment", icon: "📋" },
  { name: "Survey", href: "/dashboard/survey", icon: "⭐" },
  { name: "Progress", href: "/dashboard/progress", icon: "📈" },
  { name: "Forum", href: "/dashboard/forum", icon: "🗣️" },
  { name: "Inbox", href: "/dashboard/inbox", icon: "💬", badge: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [crisisLoading, setCrisisLoading] = useState(false);
  const [crisisSent, setCrisisSent] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Poll for unread message count every 10 seconds
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        const total = data.reduce(
          (sum: number, c: any) => sum + (c.unreadCount || 0),
          0
        );
        setUnreadCount(total);
      }
    } catch (_) {}
  };

  const handleCrisis = async () => {
    if (confirm("Apakah kamu yakin membutuhkan Bantuan Darurat? Guru BK akan segera dihubungi.")) {
      setCrisisLoading(true);
      try {
        const res = await fetch("/api/crisis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "Bantuan Darurat ditekan dari dashboard" }),
        });
        if (res.ok) {
          setCrisisSent(true);
          setTimeout(() => setCrisisSent(false), 5000);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCrisisLoading(false);
      }
    }
  };

  const Sidebar = () => (
    <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.logo}>SEHAT</div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.name}</span>
              {item.badge && unreadCount > 0 && (
                <span className={styles.navBadge}>{unreadCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          className={styles.crisisBtn}
          onClick={handleCrisis}
          disabled={crisisLoading || crisisSent}
        >
          <span>🚨</span>
          {crisisSent ? "Bantuan Dipanggil ✓" : crisisLoading ? "Mengirim..." : "Bantuan Darurat"}
        </button>

        <button
          className={styles.logoutBtn}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className={styles.layout}>
      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      <Sidebar />

      <main className={styles.main}>{children}</main>
    </div>
  );
}
