import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRFlow — HR & Internal Communication",
  description: "Modern HR and internal communication platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}