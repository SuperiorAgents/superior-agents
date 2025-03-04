import React from "react";
import { LiveAgentsPage } from "./_page";
import { redirect } from "next/navigation";

async function Page() {
  if (process.env.LIVE_AGENTS_ENABLED === "1") {
    return <LiveAgentsPage />;
  }

  return redirect("/");
}

export default Page;
