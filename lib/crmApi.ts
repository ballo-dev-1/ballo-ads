import { NextResponse } from "next/server";

export function crmOk(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function crmMessage(message: string, status = 200, extra?: Record<string, unknown>) {
  return NextResponse.json({ message, ...(extra ?? {}) }, { status });
}

export function crmError(error: string, status = 400, message?: string) {
  return NextResponse.json({ error, ...(message ? { message } : {}) }, { status });
}
