import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        padding: "40px",
        textAlign: "center",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          fontSize: 120,
          lineHeight: 1,
          marginBottom: 24,
          animation: "float 3s ease-in-out infinite",
        }}
      >
        🌿
      </div>

      <h1
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: "var(--primary)",
          margin: "0 0 8px",
          letterSpacing: "-4px",
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--primary)",
          margin: "0 0 16px",
        }}
      >
        Halaman Tidak Ditemukan
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 16,
          maxWidth: 400,
          lineHeight: 1.6,
          margin: "0 0 40px",
        }}
      >
        Sepertinya halaman yang kamu cari tidak ada. Tenang, ini bukan salahmu. Mari kembali ke tempat yang aman.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/dashboard"
          style={{
            padding: "14px 32px",
            background: "var(--primary)",
            color: "white",
            borderRadius: 99,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            transition: "opacity 0.2s",
          }}
        >
          🏠 Ke Dashboard
        </Link>
        <Link
          href="/dashboard/ai"
          style={{
            padding: "14px 32px",
            background: "rgba(0, 180, 169, 0.1)",
            color: "var(--accent)",
            borderRadius: 99,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            border: "1px solid rgba(0, 180, 169, 0.2)",
          }}
        >
          ✨ Chat dengan AI
        </Link>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
}
