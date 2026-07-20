"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#f5f0de",
          color: "#17211b",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: 520, textAlign: "center" }}>
          <h1>Uygulama yüklenemedi.</h1>
          <p>Geçici bir sorun oluştu. Lütfen yeniden dene.</p>
          {error.digest && <small>Destek kodu: {error.digest}</small>}
          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: 999,
                padding: "12px 20px",
                background: "#17211b",
                color: "#fdfcf7",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Yeniden dene
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
