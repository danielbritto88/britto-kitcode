/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bodoni Moda Variable"', '"Bodoni Moda"', 'Georgia', 'serif'],
        sans: ['"Jost Variable"', '"Jost"', 'system-ui', 'sans-serif'],
        mech: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-deep': 'var(--bg-deep)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-elev': 'var(--surface-elev)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        ghost: 'var(--text-ghost)',
        accent: 'var(--accent)',
        'accent-bright': 'var(--accent-bright)',
        'accent-soft': 'var(--accent-soft)',
        'accent-glow': 'var(--accent-glow)',
        graphite: 'var(--graphite)',
        'graphite-soft': 'var(--graphite-soft)',
        positive: 'var(--positive)',
        'positive-soft': 'var(--positive-soft)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
      },
    },
  },
  plugins: [],
};
