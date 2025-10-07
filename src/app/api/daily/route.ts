import { NextResponse } from "next/server";
import { getTodayMoonData } from "@/lib/moon";

export async function GET() {
  const data = getTodayMoonData();
  return NextResponse.json(data);
}
