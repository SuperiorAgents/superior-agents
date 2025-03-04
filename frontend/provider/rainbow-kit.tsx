"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  AuthenticationStatus,
  createAuthenticationAdapter,
  getDefaultConfig,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axios from "axios";
import { redirect } from "next/navigation";
import { recoverMessageAddress, verifyMessage } from "viem";

const config = getDefaultConfig({
  appName: "KIP Agent Creator",
  projectId: process.env.NEXT_PUBLIC_RAINBOW_KIT_PROJECT_ID!,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export function RainbowKitWalletProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  const [authStatus, setAuthStatus] =
    useState<AuthenticationStatus>("unauthenticated");

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      return "123";
    },

    createMessage: () => {
      return "Welcome to KIP Agent Creator";
    },

    verify: async ({ signature, message }) => {
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: `0x${signature.slice(2)}`,
      });
      await axios.post("/api/auth/wallet-login", {
        signature,
        address: recoveredAddress,
      });
      setAuthStatus("authenticated");
      return true;
    },

    signOut: async () => {
      await axios.post("/api/auth/wallet-logout");
      setAuthStatus("unauthenticated");
      redirect("/");
    },
  });

  useEffect(() => {
    if (authStatus === "authenticated") {
      redirect("/agent/create");
    }
  }, [authStatus]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={authStatus}
        >
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
