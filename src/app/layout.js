import { Inter } from "next/font/google";
import "./globals.css";

// Use Inter font which is similar to ChatGPT's Söhne font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "YouTube Mind - Tu Asistente de YouTube con IA",
  description: "Asistente potenciado por IA para creadores de contenido en YouTube",
};

export const viewport = {
  themeColor: "#202123",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full dark">
      <head>
        <link rel="preload" href={inter.url} as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} font-sans h-full antialiased overflow-hidden bg-background-primary text-text-primary dark`}
      >
        {children}
      </body>
    </html>
  );
}
