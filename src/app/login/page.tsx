"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (!res?.ok || res.error) {
        setError("Email/NIS atau password salah. Silakan cek kembali.");
        setIsLoading(false);
      } else {
        // signIn already refreshes SessionProvider when redirect is disabled.
        // Client navigation avoids downloading and hydrating the whole app again.
        router.replace("/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>SEHAT</div>
        <div className={styles.subtitle}>Your Space to Understand, Grow, and Feel Better.</div>

        {justRegistered && (
          <div className={styles.success}>
            ✅ Registrasi berhasil! Silakan login dengan akun baru Anda.
          </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="identifier">Email atau NIS</label>
            <input 
              id="identifier"
              type="text" 
              className={styles.input} 
              placeholder="contoh@email.com atau NIS"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <div className={styles.footer}>
          Belum punya akun? <Link href="/register">Daftar di sini</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
