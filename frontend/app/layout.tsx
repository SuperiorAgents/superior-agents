import type { Metadata } from "next";
import { Oxanium, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RainbowKitWalletProvider } from "@/provider/rainbow-kit";
import AuthProvider from "@/provider/auth";
import { AgentProvider } from "@/provider/agent";

const oxanium = Oxanium({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Superior Agents by KIP",
  description: "A platform designed for select KoLs to build, test, and deploy their own trading bots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${oxanium.variable} ${jetBrainsMono.variable} font-[var(--font-body)] antialiased`}
      >
        <RainbowKitWalletProvider>
          <AuthProvider>
            <AgentProvider>
              {children}
            </AgentProvider>
          </AuthProvider>
        </RainbowKitWalletProvider>
      </body>
    </html>
  );
}
