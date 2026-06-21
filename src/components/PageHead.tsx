export default function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10.5px] font-bold tracking-[.18em] text-primary">{kicker}</div>
      <h1 className="font-sora font-extrabold text-2xl md:text-3xl mt-1.5">{title}</h1>
      {sub && <p className="text-slate-500 text-sm mt-1.5 max-w-2xl">{sub}</p>}
    </div>
  );
}
