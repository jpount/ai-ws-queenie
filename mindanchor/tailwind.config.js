/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mind-blue': '#4299e1',
        'anchor-gold': '#f6ad55',
        'alert-cyan': '#00d4ff',
        'deep-navy': '#2d3748',
        'light-blue': '#90cdf4',
        'warm-cream': '#fef3c7',
        'neutral-gray': '#718096',
        'emergency-red': '#ff0000',
        'success-green': '#28a745',
        'warning-yellow': '#ffc107'
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}