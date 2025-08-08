"use client";

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useAction,
} from "convex/react";
import Header from "@/components/Header";
import { Lock } from "lucide-react";
import "@/app/global.css";

export default function CreateAgentLayout({ children }) {
  return (
    <main className="p-6 flex flex-col h-screen overflow-hidden">
      <Header />

      <AuthLoading>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </AuthLoading>

      <Authenticated>
        <div className="flex flex-row h-full pt-6 overflow-y-auto">
          {children}
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="flex items-center justify-center h-64 flex-col">
          <div className="rounded-lg p-6 flex flex-col items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <p className="text-sm max-w-xs text-center">
              Please connect to a wallet to view the agent dashboard.
            </p>
          </div>
        </div>
      </Unauthenticated>

      {/* <div className="flex flex-row h-full pt-6 overflow-y-auto">
        {children}
      </div> */}
    </main>
  );
}
