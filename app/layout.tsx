import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WinBot — Western University",
  description: "Rooftop window-cleaning robot system at the University of Western Ontario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
