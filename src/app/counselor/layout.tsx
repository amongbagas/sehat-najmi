"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pendingCrisis, setPendingCrisis] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const fetchBadges = async () => {
    try {
      const [crisisRes, msgRes] = await Promise.all([
        fetch("/api/crisis"),
        fetch("/api/messages"),
      ]);
      if (crisisRes.ok) {
        const crisisData = await crisisRes.json();
        setPendingCrisis(crisisData.filter((a: any) => a.status === "PENDING").length);
      }
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        const total = msgData.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
        setUnreadMessages(total);
      }
    } catch (_) {}
  };

  const navItems = [
    { label: "Overview", href: "/counselor", icon: "📊", badge: 0 },
    { label: "Antrian Krisis", href: "/counselor/crisis", icon: "🚨", badge: pendingCrisis },
    { label: "Inbox", href: "/counselor/inbox", icon: "💬", badge: unreadMessages },
    { label: "Student Data", href: "/counselor/students", icon: "👥", badge: 0 },
    { label: "Research Export", href: "/counselor/export", icon: "📤", badge: 0 },
  ];

  const Sidebar = () => (
    <aside
      style={{
        width: "240px",
        background: "var(--primary)",
        padding: "32px 0",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        zIndex: 100,
        left: 0,
        top: 0,
        transform: menuOpen ? "translateX(0)" : undefined,
        transition: "transform 0.3s ease",
      }}
    >
      <div style={{ padding: "0 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "white", margin: 0, fontSize: "20px" }}>SEHAT</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: "13px" }}>
          Counselor Panel
        </p>
      </div>

      <nav style={{ padding: "24px 0", display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 24px",
                color: isActive ? "var(--accent)" : "rgba(255,255,255,0.8)",
                backgroundColor: isActive ? "rgba(0,180,169,0.1)" : "transparent",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 500,
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                position: "relative",
              }}
            >
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span
                  style={{
                    background: item.label === "Antrian Krisis" ? "#E53E3E" : "#E53E3E",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "16px 0" }} />

        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 24px",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          ← Student View
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 24px",
            color: "#fc8181",
            fontSize: "14px",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            marginTop: "auto",
            fontFamily: "inherit",
          }}
        >
          <span>🚪</span> Logout
        </button>
      </nav>
    </aside>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none",
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 200,
          background: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: 8,
          width: 40,
          height: 40,
          fontSize: 18,
          cursor: "pointer",
        }}
        className="counselorHamburger"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 99,
          }}
        />
      )}

      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", marginLeft: "240px" }}>
        {children}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @media (max-width: 768px) {
          .counselorHamburger { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
