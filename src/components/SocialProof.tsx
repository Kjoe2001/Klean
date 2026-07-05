export function SocialProof() {
  const stats = [
    { value: '40,000+', label: 'Campaigns generated' },
    { value: '3,200+', label: 'Businesses trust Zelvoo' },
    { value: '16',     label: 'Content formats in one brief' },
    { value: '7 days', label: 'Free trial, no card required' },
  ];

  return (
    <section className="bg-[#F7F7FB] border-y border-[#E5E7EB] py-10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold font-heading text-[#0A0E27]">{s.value}</p>
              <p className="text-sm text-[#6B7280] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
