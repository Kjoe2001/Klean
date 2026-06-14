export default function GlassCard({ children, className = '' }: any) {
  return <div className={`glass p-6 ${className}`}>{children}</div>;
}
