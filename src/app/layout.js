import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import SiteShell from "../modules/common/SiteShell";

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
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
