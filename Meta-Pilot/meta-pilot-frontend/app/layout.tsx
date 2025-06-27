import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";
import ChatSupport from "@/components/Shared/ChatSupport";
import { WalletProvider } from "@/components/Providers/wallet-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MetaPilot | Web3 Automation Platform",
  description: "Automate your Web3 tasks - DAO voting, gas optimization, NFT purchases, token swaps, and more. Let AI handle your DeFi activities.",
  keywords: ["Web3", "automation", "DAO voting", "gas optimization", "NFT", "DeFi", "MetaMask", "blockchain", "Ethereum", "smart contracts"],
  authors: [{ name: "MetaPilot Team" }],
  openGraph: {
    title: "MetaPilot - Web3 Automation Platform",
    description: "Delegate your Web3 tasks to AI agents that execute automatically based on your preferences",
    url: "https://metapilot-frontend.vercel.app/",
    siteName: "MetaPilot",
    images: [{
      url: "/images/metapilot-og-image.png",
      width: 1200,
      height: 630,
      alt: "MetaPilot Web3 Automation"
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MetaPilot - Web3 Automation Platform",
    description: "Automate your Web3 tasks with intelligent AI agents",
    images: ["/images/metapilot-twitter-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  themeColor: "#040d36"
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            {children}
            <ChatSupport />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
