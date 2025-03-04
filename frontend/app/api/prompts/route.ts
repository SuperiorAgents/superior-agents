import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_AGENT_API_URL}/prompts`
  );
  return NextResponse.json(res.data);
}
