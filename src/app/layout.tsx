import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const siteDescription =
  "Join supporters from every league in the world. Pick your club, earn your generation badge, and climb from Supporter to Club Legend.";

function getRequestOrigin(host: string | null, forwardedProtocol: string | null) {
  const safeHost = host?.split(",")[0]?.trim() || "localhost:3000";
  const requestedProtocol = forwardedProtocol?.split(",")[0]?.trim();
  const protocol =
    requestedProtocol === "http" || requestedProtocol === "https"
      ? requestedProtocol
      : safeHost.startsWith("localhost")
        ? "http"
        : "https";

  try {
    return new URL(`${protocol}://${safeHost}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const origin = getRequestOrigin(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
    requestHeaders.get("x-forwarded-proto"),
  );
  const socialImageUrl = new URL("/og.png", origin).toString();

  return {
    metadataBase: origin,
    title: {
      default: "Football Community — Your club, your colours, your voice",
      template: "%s · Football Community",
    },
    description: siteDescription,
    openGraph: {
      type: "website",
      url: origin,
      siteName: "Football Community",
      title: "Football Community",
      description: siteDescription,
      images: [
        {
          url: socialImageUrl,
          width: 1734,
          height: 907,
          alt: "Football Community — Your club. Your colours. Your voice.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Football Community",
      description: siteDescription,
      images: [socialImageUrl],
    },
  };
}

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
