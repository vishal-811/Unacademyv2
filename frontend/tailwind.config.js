/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".hide-scrollbar": {
          "scrollbar-width": "none", /* For Firefox */
          "-ms-overflow-style": "none", /* For IE and Edge */
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none", /* For Chrome, Safari, and Opera */
        },
        ".smooth-scroll": {
          "scroll-behavior": "smooth", /* Makes scrolling smooth */
        },
      });
    },
  ],
}