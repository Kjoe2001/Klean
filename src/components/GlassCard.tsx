export default function GlassCard({ children, className = '' }: any) {
  return <div className={`glass-card-light glass-highlight p-6 ${className}`}>{children}</div>;
}
