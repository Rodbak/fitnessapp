import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import { AppShell } from "@/components/app-shell";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "City's Fitness",
  description: "Your fitness, your city.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="font-[family-name:var(--font-geist)] bg-white text-black antialiased min-h-full">
        <AuthProvider>
          <LangProvider>
            <AppShell>{children}</AppShell>
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
