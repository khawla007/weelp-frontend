import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        copy: 'rgb(var(--copy-rgb) / <alpha-value>)',
        label: 'rgb(var(--label-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        'surface-elevated': 'hsl(var(--surface-elevated))',
        'surface-tint': 'hsl(var(--surface-tint))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        mainBackground: 'hsl(var(--background))',
        dangerLite: 'hsl(var(--destructive) / 0.05)',
        graycolor: 'rgb(var(--weelp-gray-rgb) / <alpha-value>)',
        Bluewhale: 'rgb(var(--weelp-bluewhale-rgb) / <alpha-value>)',
        Blueish: 'rgb(var(--weelp-blueish-rgb) / <alpha-value>)',
        Lynchcolor: 'rgb(var(--weelp-lynch-rgb) / <alpha-value>)',
        solitude: 'rgb(var(--weelp-solitude-rgb) / <alpha-value>)',
        blackish: 'rgb(var(--weelp-blackish-rgb) / <alpha-value>)',
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
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        weelp: {
          'sage-deep': 'hsl(var(--weelp-sage-deep) / <alpha-value>)',
          'sage-hover': 'hsl(var(--weelp-sage-hover) / <alpha-value>)',
          'sage-tint': 'hsl(var(--weelp-sage-tint) / <alpha-value>)',
          'sage-wash': 'hsl(var(--weelp-sage-wash) / <alpha-value>)',
          'auth-neu-surface': 'hsl(var(--weelp-auth-neu-surface) / <alpha-value>)',
          steel: 'hsl(var(--weelp-steel) / <alpha-value>)',
          copy: 'rgb(var(--copy-rgb) / <alpha-value>)',
          label: 'rgb(var(--label-rgb) / <alpha-value>)',
          ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
          discount: 'hsl(var(--weelp-discount) / <alpha-value>)',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      maxWidth: {
        pen: '1480px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
