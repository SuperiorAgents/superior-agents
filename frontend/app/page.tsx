import { isLoggedIn } from "@/helpers/server.utils";
import Homepage from "./_page";
import { redirect } from "next/navigation";

export default async function Home() {
  if (await isLoggedIn()) return redirect("/agent/create");
  return <Homepage />;
}
