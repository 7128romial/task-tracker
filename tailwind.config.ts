import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        page: 'hsl(var(--bg-page))',
        panel: {
          DEFAULT: 'hsl(var(--bg-panel))',
          elev: 'hsl(var(--bg-panel-elev))',
          hover: 'hsl(var(--bg-panel-hover))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          inner: 'hsl(var(--border-inner))',
          strong: 'hsl(var(--border-strong))',
        },
        body: 'hsl(var(--text-body))',
        subtle: 'hsl(var(--text-subtle))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          hover: 'hsl(var(--accent-hover))',
        },
        severity: {
          open: 'hsl(var(--status-open))',
          progress: 'hsl(var(--status-progress))',
          done: 'hsl(var(--status-done))',
          warn: 'hsl(var(--status-warn))',
          danger: 'hsl(var(--status-danger))',
        },

        /* shadcn tokens for Radix components */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs: ['11px', '16px'],
        sm: ['12px', '18px'],
        base: ['13px', '20px'],
        lg: ['15px', '22px'],
        xl: ['18px', '24px'],
        '2xl': ['22px', '28px'],
        '3xl': ['30px', '36px'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '3px',
        lg: '4px',
      },
      boxShadow: {
        panel: '0 1px 0 rgba(0, 0, 0, 0.2)',
        elevated: '0 8px 24px rgba(0, 0, 0, 0.4)',
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
