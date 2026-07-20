export default function DashboardLoading() {
  return <main className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6"><div className="h-3 w-28 rounded bg-ink/10" /><div className="mt-3 h-12 w-72 rounded-xl bg-ink/10" /><div className="mt-8 grid gap-4 sm:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-36 rounded-3xl bg-ink/[.06]" />)}</div><div className="mt-5 h-80 rounded-3xl bg-ink/[.06]" /></main>;
}
