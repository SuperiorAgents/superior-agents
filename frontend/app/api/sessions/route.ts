import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_AGENT_API_URL}/sessions`,
    data
  );
  return NextResponse.json(res.data);
}
