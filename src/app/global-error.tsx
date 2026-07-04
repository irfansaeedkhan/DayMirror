"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
          <h2>Application error</h2>
          <p>{error.message}</p>
          <button type="button" onClick={reset}>
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
