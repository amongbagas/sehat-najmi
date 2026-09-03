"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";

type Role = "STUDENT" | "COUNSELOR";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nis, setNis] = useState("");
  const [kelas, setKelas] = useState("");
  const [nip, setNip] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok. Silakan coba lagi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const body: Record<string, string> = { name, email, password, role };
      if (role === "STUDENT") {
        body.nis = nis;
        body.kelas = kelas;
      } else {
        body.nip = nip;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan saat mendaftar.");
        setIsLoading(false);
        return;
      }

      // Registration successful, redirect to login
      router.push("/login?registered=true");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>SEHAT</div>
        <div className={styles.subtitle}>Buat akun baru untuk memulai</div>

        {/* Role Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${role === "STUDENT" ? styles.active : ""}`}
            onClick={() => setRole("STUDENT")}
          >
            🎒 Siswa
          </button>
          <button
            type="button"
            className={`${styles.tab} ${role === "COUNSELOR" ? styles.active : ""}`}
            onClick={() => setRole("COUNSELOR")}
          >
            👨‍🏫 Guru BK
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {role === "STUDENT" && (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="nis">NIS (Nomor Induk Siswa)</label>
                <input
                  id="nis"
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: 12345"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="kelas">Kelas</label>
                <input
                  id="kelas"
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: XII-IPA-1"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {role === "COUNSELOR" && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="nip">NIP (Nomor Induk Pegawai)</label>
              <input
                id="nip"
                type="text"
                className={styles.input}
                placeholder="Contoh: 198501012010011001"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="confirmPassword">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
          </button>
        </form>

        <div className={styles.footer}>
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}
