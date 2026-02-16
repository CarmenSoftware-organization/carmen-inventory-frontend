import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "@/components/providers";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carmen Inventory",
  description: "ERP for Hospitality Hotel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color={"var(--primary)"} showSpinner={true} height={3} />
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
