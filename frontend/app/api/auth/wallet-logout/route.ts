import { COOKIE_AUTH_USER } from "@/helpers/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const c = await cookies();
  c.delete(COOKIE_AUTH_USER);

  return NextResponse.json({});
}
