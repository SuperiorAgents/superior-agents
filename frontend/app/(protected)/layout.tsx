import { getAuthUserCookie, isLoggedIn } from "@/helpers/server.utils";
import { UserProvider } from "@/provider/user-provider";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (await isLoggedIn()) {
    const userData = await getAuthUserCookie();
    return (
      <UserProvider userData={JSON.parse(userData?.value as string)}>
        {children}
      </UserProvider>
    );
  }
  return redirect("/");
}
