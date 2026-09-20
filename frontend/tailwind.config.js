/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#151B2E",
          soft: "#232B45",
        },
        brand: {
          DEFAULT: "#0B3D91",
          dark: "#082C6B",
          light: "#1E5BC6",
        },
        amber: {
          DEFAULT: "#F2A93B",
          deep: "#D98F1F",
        },
        paper: "#F7F3E8",
        sage: "#6E8F72",
        coral: "#D65A4A",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        ticket: "18px",
      },
    },
  },
  plugins: [],
};