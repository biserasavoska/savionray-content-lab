import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media', // Use media queries for automatic dark mode
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Existing CSS variables as Tailwind colors
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        muted: 'var(--muted)',
        'muted-fg': 'var(--muted-fg)',
        border: 'var(--border)',
        input: 'var(--input)',
        'input-border': 'var(--input-border)',
        // Legacy compatibility
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // Lovable Design System Colors (HSL-based)
        'lovable-border': 'hsl(var(--lovable-border))',
        'lovable-input': 'hsl(var(--lovable-input))',
        'lovable-ring': 'hsl(var(--lovable-ring))',
        'lovable-background': 'hsl(var(--lovable-background))',
        'lovable-foreground': 'hsl(var(--lovable-foreground))',
        'lovable-primary': {
          DEFAULT: 'hsl(var(--lovable-primary))',
          foreground: 'hsl(var(--lovable-primary-foreground))',
        },
        'lovable-secondary': {
          DEFAULT: 'hsl(var(--lovable-secondary))',
          foreground: 'hsl(var(--lovable-secondary-foreground))',
        },
        'lovable-destructive': {
          DEFAULT: 'hsl(var(--lovable-destructive))',
          foreground: 'hsl(var(--lovable-destructive-foreground))',
        },
        'lovable-success': {
          DEFAULT: 'hsl(var(--lovable-success))',
          foreground: 'hsl(var(--lovable-success-foreground))',
        },
        'lovable-warning': {
          DEFAULT: 'hsl(var(--lovable-warning))',
          foreground: 'hsl(var(--lovable-warning-foreground))',
        },
        'lovable-info': {
          DEFAULT: 'hsl(var(--lovable-info))',
          foreground: 'hsl(var(--lovable-info-foreground))',
        },
        'lovable-muted': {
          DEFAULT: 'hsl(var(--lovable-muted))',
          foreground: 'hsl(var(--lovable-muted-foreground))',
        },
        'lovable-accent': {
          DEFAULT: 'hsl(var(--lovable-accent))',
          foreground: 'hsl(var(--lovable-accent-foreground))',
        },
        'lovable-popover': {
          DEFAULT: 'hsl(var(--lovable-popover))',
          foreground: 'hsl(var(--lovable-popover-foreground))',
        },
        'lovable-card': {
          DEFAULT: 'hsl(var(--lovable-card))',
          foreground: 'hsl(var(--lovable-card-foreground))',
        },
        'lovable-sidebar': {
          DEFAULT: 'hsl(var(--lovable-sidebar-background))',
          foreground: 'hsl(var(--lovable-sidebar-foreground))',
          primary: 'hsl(var(--lovable-sidebar-primary))',
          'primary-foreground': 'hsl(var(--lovable-sidebar-primary-foreground))',
          accent: 'hsl(var(--lovable-sidebar-accent))',
          'accent-foreground': 'hsl(var(--lovable-sidebar-accent-foreground))',
          border: 'hsl(var(--lovable-sidebar-border))',
          ring: 'hsl(var(--lovable-sidebar-ring))',
        },
      },
      borderRadius: {
        'lovable-lg': 'var(--lovable-radius)',
        'lovable-md': 'calc(var(--lovable-radius) - 2px)',
        'lovable-sm': 'calc(var(--lovable-radius) - 4px)',
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
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config 