import "./globals.css";
import SiteFooter from "../modules/common/Footer";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata = {
  title: "Found Pakistan | Find & Reunite",
  description:
    "Found Pakistan helps families and authorities report, search, and resolve missing or found cases with empathy and speed.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
