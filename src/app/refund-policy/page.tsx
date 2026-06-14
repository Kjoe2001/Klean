import MarketingNav from '@/components/MarketingNav';
export default function Page() {
  return (<><MarketingNav />
    <main className="max-w-3xl mx-auto px-5 py-14 animate-rise">
      <h1 className="font-sora font-extrabold text-3xl mb-6">Refund Policy</h1>
      <div className="glass p-7 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{`Monthly subscriptions can be cancelled anytime from Billing — access continues to the end of the paid period.\n\nRefunds: if Zelvo was materially unavailable or defective, contact support@zelvo.app within 7 days of the charge for a full refund. Refunds for change-of-mind within 48 hours of a first paid charge are honored. Mobile Money refunds are returned to the originating wallet within 5–10 business days; card refunds per your bank's timeline.`}</div>
    </main></>);
}
