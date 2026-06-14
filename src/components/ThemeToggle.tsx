'use client';
export default function ThemeToggle() {
  return (
    <button className="pill" onClick={() => {
      const d = document.documentElement.classList.toggle('dark');
      localStorage.setItem('zelvo_theme', d ? 'dark' : 'light');
    }}>🌗</button>
  );
}
