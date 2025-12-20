import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-urdu",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata = {
  title: "Found Pakistan | Find & Reunite",
  description:
    "Found Pakistan helps families and authorities report, search, and resolve missing or found cases with empathy and speed.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoUrdu.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
