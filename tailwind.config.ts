import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        cream: 'hsl(var(--cream))',
        ink: 'hsl(var(--ink))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        surface: 'hsl(var(--surface))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        priority: {
          high: 'hsl(var(--priority-high))',
          'high-bg': 'hsl(var(--priority-high-bg))',
          medium: 'hsl(var(--priority-medium))',
          'medium-bg': 'hsl(var(--priority-medium-bg))',
          low: 'hsl(var(--priority-low))',
          'low-bg': 'hsl(var(--priority-low-bg))',
        },
        status: {
          open: 'hsl(var(--status-open))',
          'open-bg': 'hsl(var(--status-open-bg))',
          progress: 'hsl(var(--status-progress))',
          'progress-bg': 'hsl(var(--status-progress-bg))',
          done: 'hsl(var(--status-done))',
          'done-bg': 'hsl(var(--status-done-bg))',
        },
      },
      fontFamily: {
        heebo: ['Heebo', 'system-ui', 'sans-serif'],
        fraunces: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Heebo', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(26, 24, 20, 0.04), 0 1px 3px 0 rgba(26, 24, 20, 0.06)',
        elevated: '0 10px 30px -12px rgba(26, 24, 20, 0.18), 0 4px 10px -4px rgba(26, 24, 20, 0.08)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
