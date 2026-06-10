import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Football Community — Your club, your colours, your voice",
    template: "%s · Football Community",
  },
  description:
    "Join supporters from every league in the world. Pick your club, earn your generation badge, and climb from Supporter to Club Legend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
