export default function AdminLoading() {
  return (
    <main className="animate-pulse p-5 sm:p-8">
      <div className="bg-ink/10 h-10 w-64 rounded-xl" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-paper border-ink/10 h-28 rounded-2xl border"
          />
        ))}
      </div>
      <div className="bg-paper border-ink/10 mt-6 h-96 rounded-3xl border" />
    </main>
  );
}
