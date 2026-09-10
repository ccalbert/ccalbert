import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Createlume — Operations software for growing nonprofits",
  description:
    "Funding discovery, grant applications, compliance tracking, and fundraising tools in one place for small and midsize nonprofits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
