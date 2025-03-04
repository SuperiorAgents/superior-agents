import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const res = await axios.post(
    `${process.env.SUPERIOR_API_URL}/api_v1/agent/create`,
    data,
    {
      headers: {
        "x-api-key": process.env.SUPERIOR_API_KEY,
      },
    }
  );
  return NextResponse.json(res.data);
}
