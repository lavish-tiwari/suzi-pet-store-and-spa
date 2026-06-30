/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        puppy: {
          cream: '#FFF9F3',        // Cream White background (light)
          beige: '#F5E8D8',        // Soft Beige card backdrops/borders
          peach: '#FFD6B0',        // Warm Peach primary accent (links, brand, buttons)
          peachhover: '#FFEAD4',   // Peach hover state
          highlight: '#FFAE63',    // Active highlight trigger
          alert: '#FF8A8A',        // Secondary highlight (deletes, alerts)
          sage: '#C8D5B9',         // Wellness/success/open-status indicator
          brown: '#8B6F5A',        // Soft Brown body text
          emphasis: '#5E4634',     // Headings/emphasis text

          // Dark mode
          darkbg: '#2B1F1A',       // Deep Coffee/Espresso background
          darkcard: '#4A372C',     // Card surface
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        // Soft brown-tinted shadows for light mode cards
        'puppy-sm': '0 2px 10px rgba(139, 111, 90, 0.08)',
        'puppy-md': '0 8px 30px rgba(139, 111, 90, 0.12)',
        'puppy-lg': '0 15px 40px rgba(139, 111, 90, 0.15)',
        // Glowing peach borders for dark mode cards
        'puppy-glow': '0 0 20px rgba(255, 174, 99, 0.15)',
      }
    },
  },
  plugins: [],
}
