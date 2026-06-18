/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#fafaf7',
        surface: '#f4f4f0',
        ink: {
          DEFAULT: '#0c0c09',
          secondary: '#5b5b4b',
          muted: '#6f6f60',
        },
        line: '#e8e8e3',
        primary: {
          DEFAULT: '#181811',
          foreground: '#f4f4f0',
        },
        danger: '#b42318',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
        xl: '18px',
      },
      fontFamily: {
        sans: [
          'Geist',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tighter: '-0.025em',
        tight: '-0.015em',
      },
      boxShadow: {
        // Single soft shadow reserved for transient elements (dropdown, dialog, palette).
        float: '0 8px 24px -12px rgba(12, 12, 9, 0.18), 0 2px 6px -2px rgba(12, 12, 9, 0.08)',
      },
      fontSize: {
        'nav': ['14px', { lineHeight: '1.2' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'label-sm': ['12px', { lineHeight: '1.1', letterSpacing: '0' }],
        'label': ['14px', { lineHeight: '1.2', letterSpacing: '0' }],
        'h-xs': ['18px', { lineHeight: '22px', letterSpacing: '0' }],
        'h-sm': ['30px', { lineHeight: '36px', letterSpacing: '-0.75px' }],
        'h-md': ['36px', { lineHeight: '40px', letterSpacing: '-0.9px' }],
      },
    },
  },
  plugins: [],
}
