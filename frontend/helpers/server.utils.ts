import { cookies } from "next/headers";
import { COOKIE_AUTH_USER } from "./constants";

export const getAuthUserCookie = async () => {
  const c = await cookies();
  return c.get(COOKIE_AUTH_USER);
};

export const isLoggedIn = async () => {
  const res = await getAuthUserCookie();
  if (res == undefined) return false;

  return true;
};
