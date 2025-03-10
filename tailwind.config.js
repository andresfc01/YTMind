/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // In v4, most configuration is moved to CSS using @theme
  // Only keep essential JavaScript configuration here
  experimental: {
    cssNativeConfig: true, // Enable CSS-based configuration
  },
  plugins: [
    "@tailwindcss/typography", // New plugin syntax in v4
  ],
};
