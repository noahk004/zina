/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        white: "var(--theme-white)",
        black: "var(--theme-black)",
        purpleLight: "var(--theme-purple-light)",
        purple1: "var(--theme-purple-1)",
        purple2: "var(--theme-purple-2)",
        purple3: "var(--theme-purple-3)",
      },
      backgroundSize: {
        'size-200': '200% 200%',
    },
    backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
    },
    },
  },
  plugins: [],
};
