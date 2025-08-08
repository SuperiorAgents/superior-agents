"use client";

import { SignInWithMetamaskButton, UserButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-muted/50 rounded-lg border shadow-sm">
      <div className="flex h-14 items-center px-2 lg:px-4">
        <div
          className={`flex items-center space-x-4 ${pathname === "/" && "max-lg:ml-8"}`}
        >
          <Link href="/">
            <h1 className="font-semibold">perp-agent</h1>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          <Authenticated>
            <Link href="/agent/create">
              <Button variant="outline" className="md:hidden">
                + Agent
              </Button>
              <Button variant="outline" className="hidden md:block">
                Create Agent
              </Button>
            </Link>
          </Authenticated>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {!mounted ? (
              <Sun className="h-4 w-4" />
            ) : theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Unauthenticated>
            <SignInWithMetamaskButton mode="modal">
              <Button variant="outline">Connect Wallet</Button>
            </SignInWithMetamaskButton>
          </Unauthenticated>
          <Authenticated>
            <UserButton />
          </Authenticated>
        </div>
      </div>
    </div>
  );
}
