import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Nexvora Digital — Premium Digital Store",
  description: "Platform e-commerce produk digital premium. Netflix, Spotify, YouTube, Disney+ dan layanan streaming lainnya dengan harga terbaik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.className} antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#050a14] text-slate-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-16 md:pt-20">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

