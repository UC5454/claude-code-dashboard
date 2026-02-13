import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Claude Code Usage Dashboard",
  description: "チーム全体の利用状況を一目で把握",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-[#f9fafb]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
