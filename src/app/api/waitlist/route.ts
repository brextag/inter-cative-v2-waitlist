import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addToWaitlist } from "@/lib/db";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }
    const result = addToWaitlist(parsed.data.email);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  // Public count only
  const { getWaitlist } = await import("@/lib/db");
  const list = getWaitlist();
  return NextResponse.json({ count: list.length });
}
