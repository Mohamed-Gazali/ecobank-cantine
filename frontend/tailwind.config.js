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
        mist: "#EEF3FC",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        ticket: "18px",
      },
      boxShadow: {
        soft: "0 10px 30px -14px rgba(11, 61, 145, 0.25)",
        card: "0 2px 10px -4px rgba(21, 27, 46, 0.08)",
      },
      keyframes: {
        ticketIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "ticket-in": "ticketIn 0.35s ease-out",
      },
    },
  },
  plugins: [],
};