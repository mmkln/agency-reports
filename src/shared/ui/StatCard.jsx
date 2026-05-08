export function StatCard({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-white/20 px-4 py-5">
      <span className="mb-1.5 block text-[13px] leading-4 text-white/85">{label}</span>
      <strong className="block text-2xl leading-7 font-extrabold text-white">{value}</strong>
    </div>
  )
}
