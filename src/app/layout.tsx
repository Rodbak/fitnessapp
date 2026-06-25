import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "City's Fitness",
  description: "Your fitness, your city.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="font-[family-name:var(--font-geist)] bg-white text-black antialiased min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
