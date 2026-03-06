import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@/lib/adminAuth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE);

  return NextResponse.json({ success: true }, { status: 200 });
}
