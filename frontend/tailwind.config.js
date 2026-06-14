/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: '#e4e4e7',
        background: '#ffffff',
        foreground: '#000000',
        muted: '#f4f4f5',
        'muted-foreground': '#71717a',
        primary: '#000000',
        'primary-foreground': '#ffffff',
        secondary: '#f4f4f5',
        'secondary-foreground': '#18181b',
        card: '#ffffff',
        'card-foreground': '#000000',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};
