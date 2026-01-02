import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Match Center",
  description: "Live fixtures, standings, and match insights"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="main-shell">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-2xl font-semibold gradient-text">
              Match Center
            </Link>
            <nav className="flex gap-4 text-sm text-slate-200">
              <Link href="/">Home</Link>
              <Link href="/league/39">Premier League</Link>
              <Link href="/league/140">La Liga</Link>
              <Link href="/league/cfb">College Football</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
