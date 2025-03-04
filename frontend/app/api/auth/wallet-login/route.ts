import { COOKIE_AUTH_USER } from "@/helpers/constants";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const res = await axios.post(
    `${process.env.SUPERIOR_API_URL}/api_v1/user/create`,
    {
      username: "",
      email: "",
      wallet_address: data.address,
    },
    {
      headers: {
        "x-api-key": process.env.SUPERIOR_API_KEY,
      },
    }
  );

  const c = await cookies();
  c.set({
    name: COOKIE_AUTH_USER,
    value: JSON.stringify(res.data.data),
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return NextResponse.json({});
}
