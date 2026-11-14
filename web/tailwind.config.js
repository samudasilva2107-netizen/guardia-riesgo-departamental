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
        crema: "#F2E8D5",
        papel: "#FBF7EE",
        navy: {
          DEFAULT: "#16274D",
          70: "#4A5878",
          20: "rgba(22, 39, 77, 0.2)",
          10: "rgba(22, 39, 77, 0.1)",
        },
        mostaza: {
          DEFAULT: "#F6B50C",
          hover: "#E5A70B",
          light: "rgba(246, 181, 12, 0.15)",
        },
        alerta: "#C62828",
        linea: "#D9CFB8",
      },
      fontFamily: {
        anton: ["var(--font-anton)", "sans-serif"],
        barlow: ["var(--font-barlow)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        card: "8px",
        capsule: "9999px",
      },
    },
  },
  plugins: [],
};
