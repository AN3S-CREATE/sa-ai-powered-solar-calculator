/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'hsl(var(--void-hsl) / <alpha-value>)',
        'deep-space': 'hsl(var(--deep-space-hsl) / <alpha-value>)',
        panel: 'hsl(var(--panel-hsl) / <alpha-value>)',
        nebula: 'hsl(var(--nebula-hsl) / <alpha-value>)',
        line: 'hsl(var(--line-channels) / calc(<alpha-value> * var(--line-alpha)))',
        'line-strong': 'hsl(var(--line-strong-channels) / calc(<alpha-value> * var(--line-strong-alpha)))',
        ink: 'hsl(var(--ink-hsl) / <alpha-value>)',
        'ink-soft': 'hsl(var(--ink-soft-hsl) / <alpha-value>)',
        'ink-muted': 'hsl(var(--ink-muted-hsl) / <alpha-value>)',
        pink: 'hsl(var(--pink-hsl) / <alpha-value>)',
        violet: 'hsl(var(--violet-hsl) / <alpha-value>)',
        blue: 'hsl(var(--blue-hsl) / <alpha-value>)',
        cyan: 'hsl(var(--cyan-hsl) / <alpha-value>)',
        'pink-glow': 'hsl(var(--pink-glow-hsl) / <alpha-value>)',
        'violet-glow': 'hsl(var(--violet-glow-hsl) / <alpha-value>)',
        'cyan-glow': 'hsl(var(--cyan-glow-hsl) / <alpha-value>)',
        danger: 'hsl(var(--danger-hsl) / <alpha-value>)',
        success: 'hsl(var(--success-hsl) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
        heading: 'var(--font-sans)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-lg)',
        '2xl': 'var(--radius-lg)',
        '3xl': 'var(--radius-lg)',
      },
      boxShadow: {
        'glow-pink': 'var(--glow-pink)',
        'glow-blue': 'var(--glow-blue)',
        'glow-cyan': 'var(--glow-cyan)',
        'focus-ring': 'var(--focus-ring)',
      },
      backgroundImage: {
        'gradient-glow': 'var(--gradient-glow)',
        'gradient-neon': 'var(--gradient-neon)',
        'gradient-space': 'var(--gradient-space)',
      },
      maxWidth: {
        measure: 'var(--measure)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        enter: 'var(--ease-enter)',
        'in-out': 'var(--ease-in-out)',
      },
    },
  },
  plugins: [],
};
